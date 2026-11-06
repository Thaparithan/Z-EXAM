import { supabase, isSupabaseConfigured, STORAGE_BUCKET, trackDownload, supabaseUrl, supabaseAnonKey } from './supabase.js';
import { SUBJECTS } from '../constants/subjects.js';

const COLLECTION_NAME = 'exam_papers';
const LOCAL_STORAGE_KEY = 'zexam_local_papers_index';
const DB_NAME = 'ZExamPDFStorage';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_blobs';

// Open IndexedDB for offline / local fallback blob storage
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
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

// Check if Supabase Cloud is active & configured
export const isSupabaseActive = () => {
  return isSupabaseConfigured;
};

// Helper: Normalize Supabase row to Z-EXAM model
const mapRowToPaper = (row) => ({
  id: row.id,
  title: row.title,
  subject: row.subject_id || row.subject || 'ict',
  subjectName: row.subject_name || row.subject_id,
  year: String(row.year || '2024'),
  term: row.term || 'Final Paper',
  grade: row.grade || 'All Grades',
  fileName: row.file_name || 'paper.pdf',
  fileSize: Number(row.file_size_bytes || row.file_size || 0),
  fileExtension: row.file_extension || (row.file_name ? row.file_name.split('.').pop().toLowerCase() : 'pdf'),
  mimeType: row.mime_type || 'application/pdf',
  fileUrl: row.file_url,
  storagePath: row.file_path,
  downloadCount: Number(row.download_count || 0),
  createdAtMs: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  isLocal: false,
});

export const paperService = {
  // Subscribe to real-time papers updates (Strictly ZERO demo papers)
  subscribePapers: (callback) => {
    if (isSupabaseActive()) {
      let isSubscribed = true;

      const fetchPapers = async () => {
        try {
          const { data, error } = await supabase
            .from(COLLECTION_NAME)
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          if (isSubscribed) {
            // Strictly real papers only - 0 dummy papers
            const mapped = (data && data.length > 0) ? data.map(mapRowToPaper) : [];
            callback(mapped);
          }
        } catch (err) {
          console.warn('Supabase query notice:', err.message);
          if (isSubscribed) {
            // Offline / Local fallback: strictly actual papers only
            const local = paperService.getLocalPapers();
            callback(local);
          }
        }
      };

      fetchPapers();

      // Listen to real-time database changes
      const channel = supabase
        .channel('zexam_papers_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: COLLECTION_NAME },
          () => {
            fetchPapers();
          }
        )
        .subscribe();

      return () => {
        isSubscribed = false;
        supabase.removeChannel(channel);
      };
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

  // Upload Paper using Real XHR Stream (Genuine non-simulated bytes, speed & ETA)
  uploadPaper: async (
    { title, subject, year, term, grade, file }, 
    onProgress = () => {},
    onAttachAbort = () => {}
  ) => {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'file';
    const mimeType = file.type || 'application/octet-stream';

    const subjectObj = SUBJECTS.find((s) => s.id.toLowerCase() === subject.toLowerCase());
    const subjectName = subjectObj ? subjectObj.name : subject.toUpperCase();

    if (isSupabaseActive()) {
      return new Promise((resolve, reject) => {
        const storagePath = `papers/${subject}/${timestamp}_${cleanFileName}`;
        const uploadEndpoint = `${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`;

        const xhr = new XMLHttpRequest();
        onAttachAbort(() => xhr.abort());

        // Real-time byte tracking stream
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent, event.loaded, event.total);
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              onProgress(100, file.size, file.size);

              // Obtain Public CDN URL
              const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(storagePath);

              // Insert metadata into PostgreSQL database
              const payload = {
                title: title.trim(),
                subject_id: subject.toLowerCase(),
                subject_name: subjectName,
                term: term || 'Final Paper',
                year: String(year),
                grade: grade || 'All Grades',
                file_name: file.name,
                file_path: storagePath,
                file_url: urlData.publicUrl,
                file_size_bytes: file.size,
                file_extension: fileExtension,
                mime_type: mimeType,
                download_count: 0,
              };

              const { data: inserted, error: dbErr } = await supabase
                .from(COLLECTION_NAME)
                .insert(payload)
                .select()
                .single();

              if (dbErr) {
                console.error('Database insertion error:', dbErr);
                throw new Error(`Database error: ${dbErr.message || 'Failed to save paper metadata'}`);
              }

              resolve({ id: inserted.id, success: true });
            } catch (err) {
              reject(err);
            }
          } else {
            // Intelligent Diagnostic Handling
            let errorMsg = `Upload failed (Status ${xhr.status})`;
            try {
              const resJson = JSON.parse(xhr.responseText);
              if (resJson.message) {
                if (resJson.message.toLowerCase().includes('bucket not found')) {
                  errorMsg = `Storage Bucket '${STORAGE_BUCKET}' not found. Please run the SQL setup script in your Supabase SQL Editor.`;
                } else {
                  errorMsg = resJson.message;
                }
              }
            } catch {
              if (xhr.status === 404) {
                errorMsg = `Storage Bucket '${STORAGE_BUCKET}' does not exist. Run the SQL migration in Supabase to create it.`;
              } else if (xhr.status === 403 || xhr.status === 401) {
                errorMsg = `Permission Denied: Please run the SQL migration in Supabase SQL Editor to enable public storage upload policy.`;
              }
            }
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network connection error while uploading to Supabase Storage.'));
        };

        xhr.onabort = () => {
          reject(new Error('Upload cancelled.'));
        };

        xhr.open('POST', uploadEndpoint, true);
        xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
        xhr.setRequestHeader('apikey', supabaseAnonKey);
        xhr.setRequestHeader('x-upsert', 'true');
        if (mimeType) {
          xhr.setRequestHeader('Content-Type', mimeType);
        }

        xhr.send(file);
      });
    }

    // Local Fallback Upload using IndexedDB + LocalStorage
    return new Promise(async (resolve, reject) => {
      try {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 20;
          if (currentProgress > 100) currentProgress = 100;
          onProgress(currentProgress, Math.round((currentProgress / 100) * file.size), file.size);
        }, 120);

        const paperId = `local_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
        await storeBlobInIndexedDB(paperId, file);

        clearInterval(interval);
        onProgress(100, file.size, file.size);

        const localPapers = paperService.getLocalPapers();
        const newPaper = {
          id: paperId,
          title: title.trim(),
          subject: subject.toLowerCase(),
          subjectName: subjectName,
          year: String(year),
          term: term || 'Final Paper',
          grade: grade || 'All Grades',
          fileName: file.name,
          fileSize: file.size,
          fileExtension: fileExtension,
          mimeType: mimeType,
          fileUrl: null, // read dynamically from IndexedDB
          isLocal: true,
          storagePath: `local/${paperId}`,
          downloadCount: 0,
          createdAtMs: timestamp,
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
    if (isSupabaseActive() && !paper.isLocal) {
      try {
        // Delete from Supabase Storage
        if (paper.storagePath) {
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([paper.storagePath])
            .catch((e) => console.warn('Storage delete notice:', e));
        }

        // Delete from database
        const { error: dbErr } = await supabase
          .from(COLLECTION_NAME)
          .delete()
          .eq('id', paper.id);

        if (dbErr) throw dbErr;
        return { success: true };
      } catch (err) {
        console.error('Failed to delete paper from Supabase:', err);
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

  // Download Paper Helper (Handles ANY File Type: PDF, Word, Images, ZIP)
  downloadPaper: async (paper) => {
    try {
      // Increment download counter
      await trackDownload(paper.id);

      if (paper.fileUrl) {
        // Fetch and download cleanly with original extension
        const response = await fetch(paper.fileUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = paper.fileName || `${paper.title}.${paper.fileExtension || 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        return;
      }

      // Local Blob download
      const blob = await getBlobFromIndexedDB(paper.id);
      if (!blob) throw new Error('File blob not found in storage');
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = paper.fileName || `${paper.title}.${paper.fileExtension || 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Download error:', err);
      if (paper.fileUrl) {
        window.open(paper.fileUrl, '_blank');
      } else {
        alert('Could not download file. Please check connection.');
      }
    }
  },

  // Get preview URL (for PDF or Image preview modal)
  getPreviewUrl: async (paper) => {
    if (paper.fileUrl) return paper.fileUrl;
    const blob = await getBlobFromIndexedDB(paper.id);
    if (blob) {
      return window.URL.createObjectURL(blob);
    }
    return null;
  },

  // Helper to read local papers array (Strictly zero fake papers)
  getLocalPapers: () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
