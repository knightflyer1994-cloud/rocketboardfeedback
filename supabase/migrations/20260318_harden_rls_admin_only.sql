
-- 1. Drop existing permissive policies
DROP POLICY IF EXISTS "Anon can view feedback sessions" ON public.feedback_sessions;
DROP POLICY IF EXISTS "Anon can view feedback answers" ON public.feedback_answers;
DROP POLICY IF EXISTS "Anon can view feedback summary" ON public.feedback_summary;
DROP POLICY IF EXISTS "Anon can update feedback sessions" ON public.feedback_sessions;

-- 2. Create restricted policies for Results Dashboard
-- Only authenticated users with admin emails can view/update this data

-- List of authorized admin emails
-- In a real production app, this would be a check against a dedicated 'admins' table
-- or a boolean 'is_admin' field on a profiles table.
-- For now, we'll hardcode the known admin.

CREATE POLICY "Admin only select feedback sessions" 
ON public.feedback_sessions 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  auth.email() IN ('kirannreddyaero@gmail.com')
);

CREATE POLICY "Admin only update feedback sessions" 
ON public.feedback_sessions 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' AND 
  auth.email() IN ('kirannreddyaero@gmail.com')
);

CREATE POLICY "Admin only delete feedback sessions" 
ON public.feedback_sessions 
FOR DELETE 
USING (
  auth.role() = 'authenticated' AND 
  auth.email() IN ('kirannreddyaero@gmail.com')
);

CREATE POLICY "Admin only select feedback answers" 
ON public.feedback_answers 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  auth.email() IN ('kirannreddyaero@gmail.com')
);

CREATE POLICY "Admin only select feedback summary" 
ON public.feedback_summary 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  auth.email() IN ('kirannreddyaero@gmail.com')
);

-- Note: We MUST maintain the ability for anonymous users to INSERT data for the feedback flow
-- but they should NOT be able to SELECT or UPDATE once submitted (except for their own session if implemented)
-- Existing INSERT policies for sessions/answers should be verified.
