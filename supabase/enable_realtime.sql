-- ==============================================================================
-- Z-EXAM: REALTIME PUBLICATION SETUP
-- Run this in Supabase Dashboard > SQL Editor > New Query > Run
-- ==============================================================================

-- 1. Enable Supabase Realtime for exam_papers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'exam_papers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_papers;
  END IF;
END $$;

