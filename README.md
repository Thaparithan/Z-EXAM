# Z-EXAM | Examination Paper Management & Distribution Portal 🎓📄
**A product of ZYNOR CREATION**

[![Netlify](https://img.shields.io/badge/Hosted_on-Netlify-00C7B7?logo=netlify&logoColor=white)]()
[![Backend](https://img.shields.io/badge/Backend-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)]()
[![Repository](https://img.shields.io/badge/GitHub-Thaparithan%2FZ--EXAM-blue?logo=github)]()

Z-EXAM is a high-speed, modern web portal engineered for distributing official examination papers and academic study resources to students. It features a stealth-protected Admin Panel where the administrator uploads exam papers across 7 target subjects, and a distraction-free Student Portal where students download papers instantly.

---

## 🌟 Key Features

### 1. 7 Target Subjects / Streams (Bilingual Localization)
- 💻 **ICT** (Information & Communication Technology / தகவல் தொடர்பாடல் தொழில்நுட்பம்)
- 📈 **Commerce** (Commerce & Accounting / வணிகக் கல்வி & கணக்கீடு)
- 📖 **Tamil** (Tamil Language & Literature / தமிழ் மொழி & இலக்கியம்)
- 🏛️ **History** (Sri Lankan & World History / வரலாறு)
- 🧮 **Maths** (Mathematics / கணிதம்)
- 🔬 **Science** (Science & Technology / விஞ்ஞானம்)
- 🎓 **A/L** (G.C.E. Advanced Level / உயர்தரம்)

### 2. Multi-Format Support (All Study Material Formats)
- **PDF Documents** (`.pdf`): In-browser high-resolution preview + 1-click download.
- **Word Documents** (`.doc`, `.docx`): Word document badge + 1-click download.
- **Images** (`.png`, `.jpg`, `.jpeg`, `.webp`): Image lightbox preview + download.
- **Archives** (`.zip`, `.rar`, `.7z`): Package badge + download.

### 3. Student Portal (Clean & Distraction-Free)
- **Zero Distractions**: Clean educational layout with 0 ads, 0 phone numbers, and 0 spam.
- **Instant Downloads**: 1-click high-speed download & in-browser preview modal.
- **Subject & Year Filtering**: Fast client-side filter by the 7 subjects, exam years (2020-2026), and term types (1st, 2nd, 3rd, Model, Past Paper, Seminar Paper).

### 4. Stealth Administrative Access
- The Student Portal has **NO** open "Admin Portal" or "Login" text visible to students.
- In the footer, an innocent-looking subtle shield icon acts as the hidden trigger.
- Master Stealth Passkey:
  - **Admin Identifier**: `zynor.ta`
  - **Secret Passkey**: `zynor@2911#`
- Also supports Supabase Auth accounts with admin role!

### 5. Cloud Architecture (Supabase PostgreSQL + Storage + Netlify CDN)
- High-speed PostgreSQL database with Row Level Security (RLS).
- Dedicated `exam-papers` bucket for high-speed CDN delivery.
- Netlify Edge routing with Single-Page Application (SPA) redirects.
- Zero Firebase dependencies.

---

## 🚀 Running the Project Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚙️ Connecting Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** ➔ Run `supabase/migrations/20261106000000_zexam_schema.sql`.
3. Set your environment variables in `.env` and Netlify Dashboard:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

---

## 🌐 Netlify Deployment

1. Connect the repository `https://github.com/Thaparithan/Z-EXAM` in Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Environment variables.
