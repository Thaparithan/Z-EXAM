# Z-EXAM Supabase Database & Storage Setup Guide

Follow these quick steps to activate your Supabase backend for Z-EXAM:

## 1. Run Migration Script
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** ➔ **New Query**.
3. Copy and run the SQL code from:
   `supabase/migrations/20261106000000_zexam_schema.sql`
4. This creates:
   - `exam_papers` table with support for all file types
   - `profiles` table
   - `exam-papers` storage bucket (public read)
   - Row Level Security (RLS) policies

## 2. Environment Variables
Add these to your Netlify Dashboard and `.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 3. Stealth Admin Access
- You can log in using either the Master Passkey:
  - **Username:** `zynor.ta`
  - **Password:** `zynor@2911#`
- Or by creating a user in **Authentication** ➔ **Users** in your Supabase dashboard and promoting them:
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
  ```
