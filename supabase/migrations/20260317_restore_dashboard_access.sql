
-- Restore SELECT access for 'anon' to enable the Results Dashboard
-- We previously locked this down, but the dashboard needs read access to function.

CREATE POLICY "Anon can view feedback sessions" ON public.feedback_sessions
  FOR SELECT USING (true);

CREATE POLICY "Anon can view feedback answers" ON public.feedback_answers
  FOR SELECT USING (true);

CREATE POLICY "Anon can view feedback summary" ON public.feedback_summary
  FOR SELECT USING (true);

-- Also allow update for sessions to capture metadata like role/company size
-- Restricted to anon for now as per current app architecture
CREATE POLICY "Anon can update feedback sessions" ON public.feedback_sessions
  FOR UPDATE USING (true);
