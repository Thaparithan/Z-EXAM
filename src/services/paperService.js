import { 
  db, 
  storage, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from './firebase';

const COLLECTION_NAME = 'exam_papers';
const LOCAL_STORAGE_KEY = 'zexam_local_papers_index';
const DB_NAME = 'ZExamPDFStorage';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_blobs';

// Open IndexedDB for offline / local fallback blob storage
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const dbInstance = event.target.result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const storeBlobInIndexedDB = async (id, file) => {
  const dbInstance = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(file, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const getBlobFromIndexedDB = async (id) => {
  const dbInstance = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const deleteBlobFromIndexedDB = async (id) => {
  const dbInstance = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

// Check if Firebase is active & ready
export const isFirebaseActive = () => {
  return !!(db && storage);
};

export const paperService = {
  // Subscribe to real-time papers updates
  subscribePapers: (callback) => {
    if (isFirebaseActive()) {
      try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const papers = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            // convert Firestore timestamp to readable ms
            createdAtMs: docSnap.data().createdAt?.toMillis?.() || Date.now()
          }));
          callback(papers);
        }, (error) => {
          console.error('Firestore snapshot listener error:', error);
          // Fallback to local on error
          callback(paperService.getLocalPapers());
        });

        return unsubscribe;
      } catch (err) {
        console.error('Failed to setup Firestore listener:', err);
      }
    }

    // Local / Offline fallback listener
    const notifyLocal = () => {
      const papers = paperService.getLocalPapers();
      callback(papers);
    };

    notifyLocal();
    const handleStorageChange = (e) => {
      if (e.key === LOCAL_STORAGE_KEY || e.type === 'zexam_local_update') {
        notifyLocal();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('zexam_local_update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('zexam_local_update', handleStorageChange);
    };
  },

  // Upload Paper (PDF + Metadata)
  uploadPaper: async ({ title, subject, year, term, grade, file }, onProgress = () => {}) => {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (isFirebaseActive()) {
      // 1. Upload to Firebase Storage
      const storagePath = `papers/${subject}/${timestamp}_${sanitizedFileName}`;
      const fileRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(fileRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          },
          (error) => {
            console.error('Firebase storage upload failed:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              // 2. Add metadata to Firestore
              const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                title: title.trim(),
                subject: subject.toLowerCase(),
                year: String(year),
                term: term || 'Final Paper',
                grade: grade || 'All Grades',
                fileName: file.name,
                fileSize: file.size,
                fileUrl: downloadUrl,
                storagePath: storagePath,
                createdAt: serverTimestamp()
              });

              resolve({ id: docRef.id, success: true });
            } catch (err) {
              console.error('Firestore save error:', err);
              reject(err);
            }
          }
        );
      });
    }

    // Local Fallback Upload using IndexedDB + LocalStorage
    return new Promise(async (resolve, reject) => {
      try {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 25;
          if (currentProgress > 100) currentProgress = 100;
          onProgress(currentProgress);
        }, 100);

        const paperId = `local_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
        await storeBlobInIndexedDB(paperId, file);

        clearInterval(interval);
        onProgress(100);

        const localPapers = paperService.getLocalPapers();
        const newPaper = {
          id: paperId,
          title: title.trim(),
          subject: subject.toLowerCase(),
          year: String(year),
          term: term || 'Final Paper',
          grade: grade || 'All Grades',
          fileName: file.name,
          fileSize: file.size,
          fileUrl: null, // Fetched dynamically from IndexedDB
          isLocal: true,
          storagePath: `local/${paperId}`,
          createdAtMs: timestamp
        };

        localPapers.unshift(newPaper);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localPapers));
        window.dispatchEvent(new Event('zexam_local_update'));

        resolve({ id: paperId, success: true });
      } catch (err) {
        console.error('Local upload error:', err);
        reject(err);
      }
    });
  },

  // Delete Paper
  deletePaper: async (paper) => {
    if (isFirebaseActive() && !paper.isLocal) {
      try {
        // Delete Firestore document
        await deleteDoc(doc(db, COLLECTION_NAME, paper.id));

        // Delete Firebase Storage object
        if (paper.storagePath) {
          const fileRef = ref(storage, paper.storagePath);
          await deleteObject(fileRef).catch((e) => console.warn('Storage delete warning:', e));
        }
        return { success: true };
      } catch (err) {
        console.error('Failed to delete paper from Firebase:', err);
        throw err;
      }
    }

    // Local Delete
    try {
      await deleteBlobFromIndexedDB(paper.id).catch(() => {});
      const localPapers = paperService.getLocalPapers().filter((p) => p.id !== paper.id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localPapers));
      window.dispatchEvent(new Event('zexam_local_update'));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete local paper:', err);
      throw err;
    }
  },

  // Download Paper Helper (Handles both Firebase CDN URLs & Local IndexedDB Blobs)
  downloadPaper: async (paper) => {
    try {
      if (paper.fileUrl) {
        // Firebase or external URL - direct fetch or anchor trigger
        const response = await fetch(paper.fileUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = paper.fileName || `${paper.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        return;
      }

      // Local Blob
      const blob = await getBlobFromIndexedDB(paper.id);
      if (!blob) throw new Error('PDF file blob not found in storage');
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = paper.fileName || `${paper.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: open in new tab if fileUrl exists
      if (paper.fileUrl) {
        window.open(paper.fileUrl, '_blank');
      } else {
        alert('Could not download file. Please check connection.');
      }
    }
  },

  // Get preview URL (for PDF preview modal)
  getPreviewUrl: async (paper) => {
    if (paper.fileUrl) return paper.fileUrl;
    const blob = await getBlobFromIndexedDB(paper.id);
    if (blob) {
      return window.URL.createObjectURL(blob);
    }
    return null;
  },

  // Helper to read local papers array (starts strictly clean: empty [])
  getLocalPapers: () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
};

