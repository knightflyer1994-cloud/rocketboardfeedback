
-- feedback_sessions table
CREATE TABLE public.feedback_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('fast', 'deep')),
  role TEXT,
  company_size_total INTEGER,
  company_size_eng INTEGER,
  hiring_volume TEXT,
  work_mode TEXT,
  persona_focus TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback sessions" ON public.feedback_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view feedback sessions" ON public.feedback_sessions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update feedback sessions" ON public.feedback_sessions
  FOR UPDATE USING (true);

-- feedback_answers table
CREATE TABLE public.feedback_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
  chapter INTEGER NOT NULL,
  question_key TEXT NOT NULL,
  answer JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, chapter, question_key)
);

ALTER TABLE public.feedback_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback answers" ON public.feedback_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view feedback answers" ON public.feedback_answers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update feedback answers" ON public.feedback_answers
  FOR UPDATE USING (true);

-- feedback_summary table
CREATE TABLE public.feedback_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
  top_bottlenecks JSONB NOT NULL DEFAULT '[]',
  knowledge_concentration JSONB NOT NULL DEFAULT '[]',
  must_have_integrations JSONB NOT NULL DEFAULT '[]',
  vision_score INTEGER,
  friction_score NUMERIC(4,2),
  key_themes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback summary" ON public.feedback_summary
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view feedback summary" ON public.feedback_summary
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update feedback summary" ON public.feedback_summary
  FOR UPDATE USING (true);

-- Timestamps trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_feedback_sessions_updated_at
  BEFORE UPDATE ON public.feedback_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_answers_updated_at
  BEFORE UPDATE ON public.feedback_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_summary_updated_at
  BEFORE UPDATE ON public.feedback_summary
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_feedback_answers_session_id ON public.feedback_answers(session_id);
CREATE INDEX idx_feedback_summary_session_id ON public.feedback_summary(session_id);
