-- ==============================================================================
-- Z-EXAM: MASTER 1-SHOT DATABASE SETUP & RESET SCRIPT
-- Copy this ENTIRE script and run in: Supabase Dashboard > SQL Editor > New query > Run
-- ==============================================================================

-- 1. CLEAN RESET (Deletes old conflicting tables, triggers, and policies cleanly)
DROP TABLE IF EXISTS public.exam_papers CASCADE;
DROP FUNCTION IF EXISTS public.increment_download(UUID);

-- 2. Enable Required UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create Fresh Exam Papers Table (Supports ALL File Types: PDF, DOC, DOCX, ZIP, PNG, etc.)
CREATE TABLE public.exam_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject_id TEXT NOT NULL,          -- ict, commerce, tamil, history, maths, science, al
    subject_name TEXT NOT NULL,
    term TEXT NOT NULL,                -- 1st Term, 2nd Term, 3rd Term, Unit Exam, Model Paper, Past Paper, Seminar Paper
    year TEXT NOT NULL,                -- 2026, 2025, 2024, etc.
    grade TEXT DEFAULT 'All Grades',   -- Grade 11, Grade 10, etc.
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_extension TEXT NOT NULL,      -- pdf, docx, zip, png, etc.
    mime_type TEXT NOT NULL,
    download_count BIGINT DEFAULT 0,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Search Indexes for Blazing Fast Queries
CREATE INDEX idx_zexam_search ON public.exam_papers (subject_id, term, year);
CREATE INDEX idx_zexam_created ON public.exam_papers (created_at DESC);

-- 5. Enable Row Level Security (RLS) on Exam Papers
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;

-- 6. Open Permissive Policies: Allow ALL Operations for Public & Admin
CREATE POLICY "Allow all select" 
    ON public.exam_papers FOR SELECT 
    USING (true);

CREATE POLICY "Allow all insert" 
    ON public.exam_papers FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow all update" 
    ON public.exam_papers FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all delete" 
    ON public.exam_papers FOR DELETE 
    USING (true);

-- 7. Ensure Storage Bucket 'exam-papers' Exists & is Public
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-papers', 'exam-papers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 8. Clean & Recreate Storage Policies (Allow Public Read, Upload, Delete)
DROP POLICY IF EXISTS "Public Read Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow all delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow all select" ON storage.objects;
DROP POLICY IF EXISTS "Allow all update" ON storage.objects;

CREATE POLICY "Allow all select" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'exam-papers');

CREATE POLICY "Allow all upload" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'exam-papers');

CREATE POLICY "Allow all update" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'exam-papers')
    WITH CHECK (bucket_id = 'exam-papers');

CREATE POLICY "Allow all delete" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'exam-papers');

-- 9. Atomic Download Counter Function
CREATE OR REPLACE FUNCTION public.increment_download(paper_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.exam_papers
    SET download_count = download_count + 1
    WHERE id = paper_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Enable Native Supabase Realtime for exam_papers
-- Allows postgres_changes stream to broadcast automatically to all connected clients
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_papers;


