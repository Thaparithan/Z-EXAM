import { supabase, isSupabaseConfigured, STORAGE_BUCKET, trackDownload } from './supabase.js';
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

const SAMPLE_STARTER_PAPERS = [
  {
    id: 'sample-ict-2024',
    title: 'G.C.E O/L ICT Model Examination Paper (Paper I & II)',
    subject: 'ict',
    subjectName: 'ICT',
    year: '2024',
    term: 'Model Paper',
    grade: 'Grade 11',
    fileName: 'sample_ict_2024_paper.pdf',
    fileSize: 456,
    fileExtension: 'pdf',
    mimeType: 'application/pdf',
    fileUrl: '/sample_ict_2024_paper.pdf',
    storagePath: 'sample/sample_ict_2024_paper.pdf',
    downloadCount: 142,
    createdAtMs: Date.now() - 3600000,
    isLocal: false,
  }
];

export const paperService = {
  // Subscribe to real-time papers updates
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
            const mapped = (data && data.length > 0) 
              ? data.map(mapRowToPaper) 
              : SAMPLE_STARTER_PAPERS;
            callback(mapped);
          }
        } catch (err) {
          console.warn('Supabase papers query warning, falling back to starter index:', err.message);
          if (isSubscribed) {
            const local = paperService.getLocalPapers();
            callback(local.length > 0 ? local : SAMPLE_STARTER_PAPERS);
          }
        }
      };

      fetchPapers();

      // Listen to real-time changes
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
      callback(papers.length > 0 ? papers : SAMPLE_STARTER_PAPERS);
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

  // Upload Paper (Supporting ANY File Type: PDF, DOCX, Images, ZIP, etc.)
  uploadPaper: async ({ title, subject, year, term, grade, file }, onProgress = () => {}) => {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'file';
    const mimeType = file.type || 'application/octet-stream';

    const subjectObj = SUBJECTS.find((s) => s.id.toLowerCase() === subject.toLowerCase());
    const subjectName = subjectObj ? subjectObj.name : subject.toUpperCase();

    if (isSupabaseActive()) {
      try {
        onProgress(20);
        const storagePath = `papers/${subject}/${timestamp}_${cleanFileName}`;

        // 1. Upload to Supabase Storage
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: mimeType,
          });

        if (uploadErr) throw uploadErr;

        onProgress(70);

        // 2. Obtain Public URL
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(uploadData.path);

        // 3. Insert record in PostgreSQL database
        const payload = {
          title: title.trim(),
          subject_id: subject.toLowerCase(),
          subject_name: subjectName,
          term: term || 'Final Paper',
          year: String(year),
          grade: grade || 'All Grades',
          file_name: file.name,
          file_path: uploadData.path,
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

        if (dbErr) throw dbErr;

        onProgress(100);
        return { id: inserted.id, success: true };
      } catch (err) {
        console.error('Supabase upload error:', err);
        throw err;
      }
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
            .catch((e) => console.warn('Storage delete warning:', e));
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

  // Helper to read local papers array
  getLocalPapers: () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
