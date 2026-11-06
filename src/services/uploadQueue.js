import { paperService } from './paperService.js';
import { toast } from './toast.js';

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
      isBusy: uploadingFiles > 0 || queuedFiles > 0,
    };
  }

  // Add multiple files to the queue (Supporting ANY File Type: PDF, DOCX, ZIP, PNG, etc.)
  addFiles(files, defaultMeta = {}) {
    const newItems = Array.from(files).map((file) => {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();

      const ext = file.name.split('.').pop()?.toLowerCase() || 'file';

      return {
        id: `upl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        fileName: file.name,
        fileExtension: ext,
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
        lastTimestamp: Date.now(),
        lastBytes: 0,
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
          ...(meta.grade && { grade: meta.grade }),
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

  // Start individual upload using Supabase & resilient pipeline
  async startUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item || item.status === 'cancelled') return;

    item.status = 'uploading';
    item.error = null;
    item.startTime = Date.now();
    item.lastTimestamp = Date.now();
    item.lastBytes = item.bytesTransferred;
    this.notify();

    try {
      await paperService.uploadPaper(
        {
          title: item.title,
          subject: item.subject,
          year: item.year,
          term: item.term,
          grade: item.grade,
          file: item.file,
        },
        (progress, loaded, total) => {
          if (item.status === 'cancelled') return;
          item.progress = progress;
          item.bytesTransferred = (loaded !== undefined) ? loaded : Math.round((progress / 100) * item.totalBytes);
          if (total) item.totalBytes = total;

          const now = Date.now();
          const elapsed = (now - item.lastTimestamp) / 1000;
          if (elapsed >= 0.4) {
            const diffBytes = item.bytesTransferred - item.lastBytes;
            const currentSpeed = diffBytes / elapsed;
            item.speed = item.speed ? (item.speed * 0.6 + currentSpeed * 0.4) : currentSpeed;
            item.lastTimestamp = now;
            item.lastBytes = item.bytesTransferred;

            if (item.speed > 0) {
              item.eta = Math.max(0, Math.round((item.totalBytes - item.bytesTransferred) / item.speed));
            }
          }
          this.notify();
        },
        (abortFn) => {
          item.abort = abortFn;
        }
      );

      item.status = 'completed';
      item.progress = 100;
      item.bytesTransferred = item.totalBytes;
      item.speed = 0;
      item.eta = 0;
      item.error = null;
      toast.success(`"${item.title}" uploaded successfully!`);
      paperService.triggerGlobalSync();
      this.notify();
      this.processQueue();
    } catch (err) {
      console.error(`Upload error on ${item.fileName}:`, err);
      
      const isCancelled = item.status === 'cancelled' || err.message?.toLowerCase().includes('cancelled');
      const isBucketError = err.message?.toLowerCase().includes('bucket') || err.message?.toLowerCase().includes('permission');

      if (!isCancelled && !isBucketError && item.retryCount < MAX_RETRIES) {
        item.retryCount += 1;
        item.status = 'queued';
        item.error = `Retrying (${item.retryCount}/${MAX_RETRIES})...`;
        this.notify();
        setTimeout(() => this.processQueue(), 1500 * item.retryCount);
      } else {
        item.status = isCancelled ? 'cancelled' : 'failed';
        item.error = err.message || 'Upload failed.';
        item.speed = 0;
        item.eta = null;
        if (!isCancelled) {
          toast.error(`Failed to upload ${item.fileName}: ${err.message || 'Error'}`);
        }
        this.notify();
        this.processQueue();
      }
    }
  }

  pauseUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;
    if (typeof item.abort === 'function') {
      try { item.abort(); } catch {}
    }
    item.status = 'paused';
    item.speed = 0;
    this.notify();
    this.processQueue();
  }

  resumeUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;
    item.status = 'queued';
    this.notify();
    this.processQueue();
  }

  retryUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;
    item.status = 'queued';
    item.error = null;
    item.progress = 0;
    item.bytesTransferred = 0;
    item.retryCount = 0;
    this.notify();
    this.processQueue();
  }

  cancelUpload(id) {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return;
    if (typeof item.abort === 'function') {
      try { item.abort(); } catch {}
    }
    item.status = 'cancelled';
    this.notify();
    this.processQueue();
  }

  retryFailed() {
    this.queue = this.queue.map((item) => {
      if (item.status === 'failed') {
        return {
          ...item,
          status: 'queued',
          error: null,
          progress: 0,
          bytesTransferred: 0,
          retryCount: 0,
        };
      }
      return item;
    });
    this.notify();
    this.processQueue();
  }

  clearCompleted() {
    this.queue = this.queue.filter((i) => i.status !== 'completed');
    this.notify();
  }

  clearAll() {
    this.queue = [];
    this.notify();
  }
}

export const uploadQueue = new UploadQueueManager();
