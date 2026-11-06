# Z-EXAM Supabase Database & Storage Setup Guide

Follow these quick steps to activate your Supabase backend for Z-EXAM:

## 1. Run Master Setup & Reset Script
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** ➔ **+ New query**.
3. Copy the entire contents of:
   `supabase/schema.sql`
4. Paste it into the editor and click **Run**.
5. This automatically:
   - Resets any conflicting old tables/policies cleanly
   - Enables UUID extension
   - Creates the `exam_papers` table supporting ALL formats (PDF, DOCX, ZIP, PNG, etc.)
   - Creates search performance indexes
   - Sets up permissive Row Level Security (RLS) policies
   - Creates the public `exam-papers` storage bucket with upload & download permissions
   - Creates the atomic `increment_download` RPC function

## 2. Environment Variables
Already configured in `.env` and Netlify:
```env
VITE_SUPABASE_URL=https://mvufpjwmuphzgykpaswn.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 3. Stealth Admin Credentials
- **Username:** `zynor.ta`
- **Password:** `zynor@2911#`
- **Admin Portal URL:** `/#admin`
