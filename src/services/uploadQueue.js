import { 
  db, 
  storage, 
  collection, 
  addDoc, 
  serverTimestamp,
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from './firebase';
import { isFirebaseActive, paperService } from './paperService';

const COLLECTION_NAME = 'exam_papers';
const MAX_CONCURRENT_UPLOADS = 3;
const MAX_RETRIES = 2;

class UploadQueueManager {
  constructor() {
    this.queue = [];
    this.listeners = new Set();
    this.activeUploadsCount = 0;
  }

  // Subscribe UI to queue state updates
  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getState());
    return () => {
      this.listeners.delete(callback);
    };
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((callback) => callback(state));
  }

  getState() {
    const totalFiles = this.queue.length;
    const completedFiles = this.queue.filter((i) => i.status === 'completed').length;
    const failedFiles = this.queue.filter((i) => i.status === 'failed').length;
    const uploadingFiles = this.queue.filter((i) => i.status === 'uploading').length;
    const queuedFiles = this.queue.filter((i) => i.status === 'queued').length;

    const totalBytes = this.queue.reduce((acc, i) => acc + (i.totalBytes || 0), 0);
    const totalTransferred = this.queue.reduce((acc, i) => acc + (i.bytesTransferred || 0), 0);
    const overallProgress = totalBytes > 0 ? Math.round((totalTransferred / totalBytes) * 100) : 0;
    const overallSpeed = this.queue
      .filter((i) => i.status === 'uploading' && i.speed)
      .reduce((acc, i) => acc + i.speed, 0);

    return {
      items: [...this.queue],
      totalFiles,
      completedFiles,
      failedFiles,
      uploadingFiles,
      queuedFiles,
      totalBytes,
      totalTransferred,
      overallProgress,
      overallSpeed,
      isBusy: uploadingFiles > 0 || queuedFiles > 0
    };
  }

  // Add multiple files to the queue (Batch 5-10+ files)
  addFiles(files, defaultMeta = {}) {
    const newItems = Array.from(files).map((file) => {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();

      return {
        id: `upl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        fileName: file.name,
        totalBytes: file.size,
        bytesTransferred: 0,
        progress: 0,
        speed: 0,
        eta: null,
        title: cleanTitle,
        subject: defaultMeta.subject || 'ict',
        year: defaultMeta.year || '2024',
        term: defaultMeta.term || '3rd Term',
        grade: defaultMeta.grade || 'Grade 11',
        status: 'queued', // 'queued' | 'uploading' | 'paused' | 'completed' | 'failed' | 'cancelled'
        error: null,
        retryCount: 0,
        uploadTask: null,
        lastTimestamp: Date.now(),
        lastBytes: 0
      };
    });

    this.queue = [...this.queue, ...newItems];
    this.notify();
    this.processQueue();
  }

  // Update metadata for a queued item
  updateItem(id, updates) {
    this.queue = this.queue.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    this.notify();
  }

  // Apply metadata to all pending items in batch
  applyMetadataToPending(meta) {
    this.queue = this.queue.map((item) => {
      if (item.status === 'queued' || item.status === 'paused') {
        return {
          ...item,
          ...(meta.subject && { subject: meta.subject }),
          ...(meta.year && { year: meta.year }),
          ...(meta.term && { term: meta.term }),
          ...(meta.grade && { grade: meta.grade })
        };
      }
      return item;
    });
    this.notify();
  }

  // Process queue respecting max concurrency (3 uploads simultaneously)
  processQueue() {
    const active = this.queue.filter((i) => i.status === 'uploading');
    this.activeUploadsCount = active.length;

    if (this.activeUploadsCount >= MAX_CONCURRENT_UPLOADS) {
      return;
    }

    const availableSlots = MAX_CONCURRENT_UPLOADS - this.activeUploadsCount;
    const nextItems = this.queue
      .filter((i) => i.status === 'queued')
      .slice(0, availableSlots);

    nextItems.forEach((item) => {
      this.startUpload(item.id);
    });
  }

  // Start individual upload
  startUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;

    item.status = 'uploading';
    item.error = null;
    item.startTime = Date.now();
    item.lastTimestamp = Date.now();
    item.lastBytes = item.bytesTransferred;
    this.notify();

    // Watchdog: detect if upload is stalled at 0 bytes for > 10 seconds
    const stallWatchdog = setInterval(() => {
      if (item.status === 'uploading' && item.bytesTransferred === 0) {
        const elapsed = (Date.now() - item.startTime) / 1000;
        if (elapsed > 10) {
          item.error = 'Connecting to Firebase Storage... (If stuck, check Firebase Console > Storage to enable bucket & set Rules to allow write)';
          this.notify();
        }
      } else {
        clearInterval(stallWatchdog);
      }
    }, 2000);

    if (isFirebaseActive()) {
      const timestamp = Date.now();
      const sanitizedName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `papers/${item.subject}/${timestamp}_${sanitizedName}`;
      const fileRef = ref(storage, storagePath);

      // Direct resumable upload from browser
      const uploadTask = uploadBytesResumable(fileRef, item.file);
      item.uploadTask = uploadTask;

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          clearInterval(stallWatchdog);
          const now = Date.now();
          const timeDelta = (now - item.lastTimestamp) / 1000;

          if (timeDelta >= 0.4) {
            const bytesDelta = snapshot.bytesTransferred - item.lastBytes;
            const currentSpeed = bytesDelta / timeDelta;
            item.speed = item.speed ? (item.speed * 0.6 + currentSpeed * 0.4) : currentSpeed;
            item.lastTimestamp = now;
            item.lastBytes = snapshot.bytesTransferred;

            if (item.speed > 0) {
              item.eta = Math.max(0, Math.round((snapshot.totalBytes - snapshot.bytesTransferred) / item.speed));
            }
          }

          item.bytesTransferred = snapshot.bytesTransferred;
          item.totalBytes = snapshot.totalBytes;
          item.progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

          if (snapshot.state === 'paused') {
            item.status = 'paused';
          } else if (snapshot.state === 'running' && item.status !== 'uploading') {
            item.status = 'uploading';
          }

          this.notify();
        },
        async (error) => {
          clearInterval(stallWatchdog);
          console.error(`Upload error on ${item.fileName}:`, error);

          let userFriendlyError = error.message;
          if (error.code === 'storage/unauthorized') {
            userFriendlyError = 'Permission Denied: Firebase Storage Security Rules are blocking uploads. Go to Firebase Console > Storage > Rules, set "allow read, write: if true;" and click Publish.';
          } else if (error.code === 'storage/bucket-not-found' || error.code === 'storage/project-not-found') {
            userFriendlyError = 'Firebase Storage bucket not activated yet. Go to Firebase Console > Storage and click "Get Started".';
          } else if (error.code === 'storage/canceled') {
            userFriendlyError = 'Upload cancelled.';
          }

          // If unauthorized or bucket missing, do not retry blindly
          if (error.code === 'storage/unauthorized' || error.code === 'storage/bucket-not-found') {
            item.status = 'failed';
            item.error = userFriendlyError;
            item.speed = 0;
            item.eta = null;
            this.notify();
            this.processQueue();
            return;
          }

          // Bounded retry with exponential backoff on recoverable network errors
          if (item.retryCount < MAX_RETRIES && error.code !== 'storage/canceled') {
            item.retryCount += 1;
            item.status = 'queued';
            item.error = `Network hiccup. Retrying (${item.retryCount}/${MAX_RETRIES})...`;
            this.notify();
            setTimeout(() => {
              this.processQueue();
            }, Math.pow(2, item.retryCount) * 1000);
          } else {
            item.status = error.code === 'storage/canceled' ? 'cancelled' : 'failed';
            item.error = userFriendlyError;
            item.speed = 0;
            item.eta = null;
            this.notify();
            this.processQueue();
          }
        },
        async () => {
          clearInterval(stallWatchdog);
          try {
            // Obtain Firebase Storage reference URL
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            // Database Insertion (Cloud Firestore)
            await addDoc(collection(db, COLLECTION_NAME), {
              title: item.title.trim(),
              subject: item.subject.toLowerCase(),
              year: String(item.year),
              term: item.term || 'Final Paper',
              grade: item.grade || 'All Grades',
              fileName: item.fileName,
              fileSize: item.file.size,
              fileUrl: downloadUrl,
              storagePath: storagePath,
              published: true,
              createdAt: serverTimestamp()
            });

            item.status = 'completed';
            item.progress = 100;
            item.bytesTransferred = item.totalBytes;
            item.speed = 0;
            item.eta = null;
            item.error = null;
          } catch (dbErr) {
            console.error('Failed to save paper metadata:', dbErr);
            item.status = 'failed';
            item.error = 'Upload completed but database save failed. Retry database save.';
          } finally {
            this.notify();
            this.processQueue();
          }
        }
      );
    } else {
      // Local fallback simulation with exact state tracking
      let transferred = 0;
      const step = item.totalBytes / 20;
      const interval = setInterval(async () => {
        if (item.status === 'paused') return;
        if (item.status === 'cancelled') {
          clearInterval(interval);
          this.processQueue();
          return;
        }

        transferred += step;
        if (transferred >= item.totalBytes) {
          transferred = item.totalBytes;
          clearInterval(interval);
          try {
            await paperService.uploadPaper({
              title: item.title,
              subject: item.subject,
              year: item.year,
              term: item.term,
              grade: item.grade,
              file: item.file
            });
            item.status = 'completed';
            item.progress = 100;
            item.bytesTransferred = item.totalBytes;
          } catch (e) {
            item.status = 'failed';
            item.error = e.message;
          }
          this.notify();
          this.processQueue();
        } else {
          item.bytesTransferred = transferred;
          item.progress = Math.round((transferred / item.totalBytes) * 100);
          item.speed = step * 5; // simulated speed
          item.eta = Math.max(0, Math.round((item.totalBytes - transferred) / item.speed));
          this.notify();
        }
      }, 200);
    }
  }

  // Pause an active upload
  pauseUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;

    if (item.uploadTask && typeof item.uploadTask.pause === 'function') {
      item.uploadTask.pause();
    }
    item.status = 'paused';
    item.speed = 0;
    item.eta = null;
    this.notify();
    this.processQueue();
  }

  // Resume a paused upload
  resumeUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;

    if (item.uploadTask && typeof item.uploadTask.resume === 'function') {
      item.uploadTask.resume();
      item.status = 'uploading';
      this.notify();
    } else {
      item.status = 'queued';
      this.notify();
      this.processQueue();
    }
  }

  // Cancel an upload
  cancelUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;

    if (item.uploadTask && typeof item.uploadTask.cancel === 'function') {
      item.uploadTask.cancel();
    }
    item.status = 'cancelled';
    item.speed = 0;
    item.eta = null;
    this.notify();
    this.processQueue();
  }

  // Retry a failed or cancelled upload
  retryUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;

    item.status = 'queued';
    item.error = null;
    item.retryCount = 0;
    item.progress = 0;
    item.bytesTransferred = 0;
    this.notify();
    this.processQueue();
  }

  // Remove item from queue
  removeItem(id) {
    const item = this.queue.find((i) => i.id === id);
    if (item && item.status === 'uploading') {
      this.cancelUpload(id);
    }
    this.queue = this.queue.filter((i) => i.id !== id);
    this.notify();
    this.processQueue();
  }

  // Clear completed uploads from queue
  clearCompleted() {
    this.queue = this.queue.filter((i) => i.status !== 'completed');
    this.notify();
  }

  // Pause all active uploads
  pauseAll() {
    this.queue.forEach((item) => {
      if (item.status === 'uploading') {
        this.pauseUpload(item.id);
      } else if (item.status === 'queued') {
        item.status = 'paused';
      }
    });
    this.notify();
  }

  // Resume all paused uploads
  resumeAll() {
    this.queue.forEach((item) => {
      if (item.status === 'paused') {
        item.status = 'queued';
      }
    });
    this.notify();
    this.processQueue();
  }
}

export const uploadQueue = new UploadQueueManager();

