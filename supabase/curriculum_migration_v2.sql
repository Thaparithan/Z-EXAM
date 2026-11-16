-- ==============================================================================
-- Z-EXAM v2.0.0 CURRICULUM MIGRATION (Grade 10, Grade 11, A/L, Religion Streams)
-- Run this in Supabase Dashboard > SQL Editor > New query > Run
-- ==============================================================================

-- 1. Add curriculum grouping and sub-category columns safely
ALTER TABLE public.exam_papers 
ADD COLUMN IF NOT EXISTS grade_level TEXT DEFAULT 'grade10',
ADD COLUMN IF NOT EXISTS subject_group TEXT DEFAULT 'core',
ADD COLUMN IF NOT EXISTS sub_category TEXT DEFAULT NULL;

-- 2. Fast querying composite index
CREATE INDEX IF NOT EXISTS idx_zexam_curriculum_v2 
ON public.exam_papers (grade_level, subject_id, sub_category);

-- 3. Backfill existing uploaded Saivaneri / Hinduism religion papers
UPDATE public.exam_papers
SET sub_category = 'hinduism', 
    subject_group = 'core',
    grade_level = 'grade10'
WHERE subject_id = 'religion' 
  AND (sub_category IS NULL OR sub_category = '')
  AND (
    LOWER(title) LIKE '%saiva%' 
    OR LOWER(file_name) LIKE '%saiva%'
    OR LOWER(title) LIKE '%hindu%' 
    OR LOWER(file_name) LIKE '%hindu%'
  );

-- 4. Clean up any encoded grade delimiters
UPDATE public.exam_papers
SET grade = 'grade10'
WHERE grade LIKE 'grade10::%';

-- 5. Ensure Supabase Realtime publication includes exam_papers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'exam_papers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_papers;
  END IF;
END $$;
