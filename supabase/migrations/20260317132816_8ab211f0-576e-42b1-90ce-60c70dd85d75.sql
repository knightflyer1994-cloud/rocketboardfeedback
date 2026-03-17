
-- Create feedback_contacts table if it doesn't exist (with contact_phone from the start)
CREATE TABLE IF NOT EXISTS public.feedback_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  contact_name text,
  contact_email text,
  contact_phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add contact_phone column if table already existed without it
ALTER TABLE public.feedback_contacts
  ADD COLUMN IF NOT EXISTS contact_phone text;

-- Enable RLS
ALTER TABLE public.feedback_contacts ENABLE ROW LEVEL SECURITY;

-- Insert-only policy for anonymous users (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'feedback_contacts' AND policyname = 'Anyone can insert feedback contacts'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can insert feedback contacts" ON public.feedback_contacts FOR INSERT WITH CHECK (true)';
  END IF;
END $$;
