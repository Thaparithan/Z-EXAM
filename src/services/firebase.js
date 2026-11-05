import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Permanent Firebase Cloud Configuration for Z-EXAM
const firebaseConfig = {
  apiKey: "AIzaSyBrevWLXn-i1jy13pbg1wzuMLBNMj0A_Q4",
  authDomain: "z-exam-45a94.firebaseapp.com",
  projectId: "z-exam-45a94",
  storageBucket: "z-exam-45a94.firebasestorage.app",
  messagingSenderId: "892292945322",
  appId: "1:892292945322:web:6e8ab57fea8437a752c7d3",
  measurementId: "G-XEVH8YLFXN"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Automatically sign in anonymously so request.auth != null passes in rules
try {
  signInAnonymously(auth).catch((err) => {
    console.warn('Anonymous auth note (can be enabled in Firebase console):', err.message);
  });
} catch (e) {
  // Ignore if auth provider is offline
}

export { 
  app, 
  db, 
  storage, 
  auth,
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
};
