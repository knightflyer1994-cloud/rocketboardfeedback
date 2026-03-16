
-- 1. Security Lockdown for existing tables: Restriction to INSERT only for 'anon' role

-- feedback_sessions policies update
ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view feedback sessions" ON public.feedback_sessions;
DROP POLICY IF EXISTS "Anyone can update feedback sessions" ON public.feedback_sessions;
DROP POLICY IF EXISTS "Anyone can insert feedback sessions" ON public.feedback_sessions;

CREATE POLICY "Anon can insert feedback sessions" ON public.feedback_sessions
  FOR INSERT WITH CHECK (true);

-- (SELECT is intentionally omitted to prevent data exfiltration)

-- feedback_answers policies update
ALTER TABLE public.feedback_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view feedback answers" ON public.feedback_answers;
DROP POLICY IF EXISTS "Anyone can update feedback answers" ON public.feedback_answers;
DROP POLICY IF EXISTS "Anyone can insert feedback answers" ON public.feedback_answers;

CREATE POLICY "Anon can insert feedback answers" ON public.feedback_answers
  FOR INSERT WITH CHECK (true);


-- feedback_summary policies update
ALTER TABLE public.feedback_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view feedback summary" ON public.feedback_summary;
DROP POLICY IF EXISTS "Anyone can update feedback summary" ON public.feedback_summary;
DROP POLICY IF EXISTS "Anyone can insert feedback summary" ON public.feedback_summary;

CREATE POLICY "Anon can insert feedback summary" ON public.feedback_summary
  FOR INSERT WITH CHECK (true);


-- 2. New table for PII (feedback_contacts)
CREATE TABLE public.feedback_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
  consent BOOLEAN NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert feedback contacts" ON public.feedback_contacts
  FOR INSERT WITH CHECK (true);
-- No SELECT/UPDATE/DELETE policies for anon role
