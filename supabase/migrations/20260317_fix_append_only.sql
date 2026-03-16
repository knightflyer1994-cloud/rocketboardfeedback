
-- Drop the unique constraint to allow multiple inserts for the same question
-- This enables append-only logic which is simpler to secure with insert-only RLS
ALTER TABLE public.feedback_answers 
DROP CONSTRAINT IF EXISTS feedback_answers_session_id_chapter_question_key_key;

-- Add an index for performance since the unique constraint also acted as an index
CREATE INDEX IF NOT EXISTS idx_feedback_answers_composite 
ON public.feedback_answers (session_id, chapter, question_key);
