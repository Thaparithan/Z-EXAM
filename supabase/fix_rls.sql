-- ==============================================================================
-- Z-EXAM: Instant 1-Click Fix for Supabase Row Level Security (RLS) Policy Error
-- Copy and run this in: Supabase Dashboard > SQL Editor > New query > Run
-- ==============================================================================

-- 1. Ensure table exists with all required columns
CREATE TABLE IF NOT EXISTS public.exam_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    term TEXT NOT NULL,
    year TEXT NOT NULL,
    grade TEXT DEFAULT 'All Grades',
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_extension TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    download_count BIGINT DEFAULT 0,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Drop all old conflicting policies on exam_papers
DROP POLICY IF EXISTS "Public students can view exam papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admins can insert exam papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admins can update exam papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admins can delete exam papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Public Read Papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admin Insert Papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admin Update Papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admin Delete Papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Allow all read" ON public.exam_papers;
DROP POLICY IF EXISTS "Allow all insert" ON public.exam_papers;
DROP POLICY IF EXISTS "Allow all update" ON public.exam_papers;
DROP POLICY IF EXISTS "Allow all delete" ON public.exam_papers;

-- 3. Enable RLS and create clean, permissive policies
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read" 
    ON public.exam_papers FOR SELECT 
    USING (true);

CREATE POLICY "Allow all insert" 
    ON public.exam_papers FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow all update" 
    ON public.exam_papers FOR UPDATE 
    USING (true);

CREATE POLICY "Allow all delete" 
    ON public.exam_papers FOR DELETE 
    USING (true);

-- 4. Ensure storage bucket 'exam-papers' is public and has open policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-papers', 'exam-papers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow all delete" ON storage.objects;

CREATE POLICY "Public Read Bucket" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'exam-papers');

CREATE POLICY "Allow all upload" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'exam-papers');

CREATE POLICY "Allow all delete" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'exam-papers');
