
-- Add contact_phone to feedback_contacts
ALTER TABLE public.feedback_contacts 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;
