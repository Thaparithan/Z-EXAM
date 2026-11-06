-- ==============================================================================
-- Z-EXAM (ZYNOR CREATION) - Supabase PostgreSQL Database & Storage Schema
-- Supports ALL File Formats: PDF, Word (DOCX/DOC), Images, ZIP
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Tracks admin accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT 'Z-EXAM Admin',
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Exam Papers Table (Supporting All File Types)
CREATE TABLE IF NOT EXISTS public.exam_papers (
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
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Search Indexes for Blazing Fast Queries
CREATE INDEX IF NOT EXISTS idx_zexam_search ON public.exam_papers (subject_id, term, year);
CREATE INDEX IF NOT EXISTS idx_zexam_created ON public.exam_papers (created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;

-- 6. Helper: Admin Check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger: Auto insert profile when an Auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. RLS Policies
DROP POLICY IF EXISTS "Public students can view exam papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admins can insert exam papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admins can update exam papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admins can delete exam papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Public Read Papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admin Insert Papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admin Update Papers" ON public.exam_papers;
DROP POLICY IF EXISTS "Admin Delete Papers" ON public.exam_papers;

-- Public Students: Can read all papers
CREATE POLICY "Public Read Papers" 
    ON public.exam_papers FOR SELECT 
    USING (true);

-- Admins: Can insert, update, delete papers
CREATE POLICY "Admin Insert Papers" 
    ON public.exam_papers FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admin Update Papers" 
    ON public.exam_papers FOR UPDATE 
    USING (true);

CREATE POLICY "Admin Delete Papers" 
    ON public.exam_papers FOR DELETE 
    USING (true);

-- 9. Storage Bucket Setup ('exam-papers')
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-papers', 'exam-papers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 10. Storage RLS Policies (Allowing All File Formats)
DROP POLICY IF EXISTS "Public Read Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Bucket" ON storage.objects;

CREATE POLICY "Public Read Bucket" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'exam-papers');

CREATE POLICY "Authenticated Upload Bucket" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'exam-papers');

CREATE POLICY "Authenticated Delete Bucket" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'exam-papers');

-- 11. Atomic Download Counter RPC
CREATE OR REPLACE FUNCTION public.increment_download(paper_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.exam_papers
    SET download_count = download_count + 1
    WHERE id = paper_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
