
-- ============================================================
-- 20260318_harden_rls_admin_only
-- Restrict SELECT/DELETE on all feedback tables to the single
-- admin user (kirannreddyaero@gmail.com).
-- Public INSERT/UPDATE policies are preserved.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.email() = 'kirannreddyaero@gmail.com';
$$;

-- feedback_sessions
DROP POLICY IF EXISTS "Anyone can view feedback sessions" ON public.feedback_sessions;
DROP POLICY IF EXISTS "Admin can view feedback sessions"  ON public.feedback_sessions;
DROP POLICY IF EXISTS "Admin can delete feedback sessions" ON public.feedback_sessions;

CREATE POLICY "Admin can view feedback sessions"
  ON public.feedback_sessions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can delete feedback sessions"
  ON public.feedback_sessions FOR DELETE
  USING (public.is_admin());

-- feedback_answers
DROP POLICY IF EXISTS "Anyone can view feedback answers" ON public.feedback_answers;
DROP POLICY IF EXISTS "Admin can view feedback answers"  ON public.feedback_answers;
DROP POLICY IF EXISTS "Admin can delete feedback answers" ON public.feedback_answers;

CREATE POLICY "Admin can view feedback answers"
  ON public.feedback_answers FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can delete feedback answers"
  ON public.feedback_answers FOR DELETE
  USING (public.is_admin());

-- feedback_summary
DROP POLICY IF EXISTS "Anyone can view feedback summary" ON public.feedback_summary;
DROP POLICY IF EXISTS "Admin can view feedback summary"  ON public.feedback_summary;
DROP POLICY IF EXISTS "Admin can delete feedback summary" ON public.feedback_summary;

CREATE POLICY "Admin can view feedback summary"
  ON public.feedback_summary FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can delete feedback summary"
  ON public.feedback_summary FOR DELETE
  USING (public.is_admin());

-- feedback_contacts
DROP POLICY IF EXISTS "Admin can view feedback contacts"  ON public.feedback_contacts;
DROP POLICY IF EXISTS "Admin can delete feedback contacts" ON public.feedback_contacts;

CREATE POLICY "Admin can view feedback contacts"
  ON public.feedback_contacts FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can delete feedback contacts"
  ON public.feedback_contacts FOR DELETE
  USING (public.is_admin());
