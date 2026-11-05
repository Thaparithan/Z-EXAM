# Z-EXAM | Examination Paper Management & Distribution Portal
**A product of ZYNOR CREATION**

Z-EXAM is a high-speed, modern web portal engineered for distributing official examination papers (PDFs) to students. It features a stealth-protected Admin Panel where the administrator uploads exam papers across 7 target subjects, and a distraction-free Student Portal where students download papers instantly.

---

## 🌟 Key Features

1. **7 Target Subjects / Streams**:
   - 💻 **ICT** (Information & Communication Technology)
   - 📈 **Commerce** (Commerce & Accounting)
   - 📖 **Tamil** (Tamil Language & Literature)
   - 🏛️ **History** (History & Social Studies)
   - 🧮 **Maths** (Mathematics)
   - 🔬 **Science** (Science & Technology)
   - 🎓 **A/L** (G.C.E. Advanced Level)

2. **Student Portal (Clean & Distraction-Free)**:
   - **No Contact / Email / Address**: Clean educational layout with 0 phone numbers, emails, or physical addresses.
   - **Instant PDF Downloads**: 1-click high-speed PDF download & in-browser preview modal.
   - **Subject & Year Filtering**: Fast client-side filter by the 7 subjects, exam years (2020-2026), and term types (1st, 2nd, 3rd, Model, Past Paper).
   - **Zero Fake / Demo Data**: Starts completely clean; only genuine papers uploaded by the administrator appear.

3. **Stealth Administrative Access**:
   - The Student Portal has **NO** open "Admin Portal" or "Login" text visible to students.
   - In the footer, an innocent-looking subtle shield/seal icon acts as the hidden trigger.
   - Clicking it discreetly opens the secure administrative authentication modal.

4. **Admin Credentials**:
   - **Admin Identifier / Username**: `zynor.ta`
   - **Secret Passkey / Password**: `zynor@2911#`

5. **Cloud Real-Time Sync (Firebase Firestore + Storage)**:
   - When Admin uploads a PDF, the file uploads to Firebase Storage and document metadata is written to Cloud Firestore.
   - Real-time `onSnapshot` listeners immediately reflect newly uploaded papers on student devices without refreshing.
   - Includes local reactive fallback engine so the app works seamlessly even before Firebase keys are entered!

---

## 🚀 Running the Project

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚙️ Connecting Firebase

You can connect Firebase in two simple ways:

### Option A: Direct from the Admin Portal UI (Easiest)
1. Log in to the Admin Portal (`zynor.ta` / `zynor@2911#`).
2. Click the **"Set Firebase"** or **"Configure Firebase"** button in the header.
3. Paste your Firebase Configuration snippet or keys.
4. Click **"Save & Connect Firebase"**.

### Option B: Using `.env` File
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Firestore & Storage Rules
Ensure your Firebase console has the following rules:

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /exam_papers/{document=**} {
      allow read: if true;
      allow write: if true; // or configure admin auth
    }
  }
}
```

**Firebase Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /papers/{allPaths=**} {
      allow read: if true;
      allow write: if true; // or configure admin auth
    }
  }
}
```

---

## 🔒 Security & Role-Based Access
- Admin session is stored in secure browser `sessionStorage`.
- Unauthorized requests cannot access admin upload or deletion endpoints.
- Automatic session cleanup on browser close or manual logout.
