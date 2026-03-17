import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SessionData, AllAnswers, InsightReport, FlowMode } from '@/types/feedback';

export function useFeedbackSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [answers, setAnswers] = useState<AllAnswers>({});
  const [saving, setSaving] = useState(false);

  const createSession = useCallback(async (mode: FlowMode) => {
    setSaving(true);
    const sessionId = crypto.randomUUID();
    try {
      const { error } = await supabase
        .from('feedback_sessions')
        .insert({ id: sessionId, mode, completed: false });
      
      if (error) throw error;
      
      const newSession: SessionData = { id: sessionId, mode };
      setSession(newSession);
      return newSession;
    } catch (e) {
      console.error('Error creating session:', e);
      // Fallback to local-only session if DB insert fails
      const localSession: SessionData = { id: sessionId, mode };
      setSession(localSession);
      return localSession;
    } finally {
      setSaving(false);
    }
  }, []);

  const saveAnswer = useCallback(async (
    sessionId: string,
    chapter: number,
    questionKey: string,
    value: unknown
  ) => {
    // Optimistic update
    setAnswers(prev => ({
      ...prev,
      [chapter]: {
        ...(prev[chapter] || {}),
        [questionKey]: value,
      },
    }));

    try {
      await supabase
        .from('feedback_answers')
        .upsert(
          {
            session_id: sessionId,
            chapter,
            question_key: questionKey,
            answer: { value: value as any },
          },
          { onConflict: 'session_id, chapter, question_key' }
        );
    } catch (e) {
      console.error('Error saving answer:', e);
    }
  }, []);

  const updateSession = useCallback(async (
    sessionId: string,
    updates: Partial<SessionData>
  ) => {
    setSession(prev => prev ? { ...prev, ...updates } : prev);
    try {
      const { mode: _mode, id: _id, ...dbUpdates } = updates as SessionData;
      // NOTE: Update is now restricted for anon. We will skip this update on the client
      // or handle via session summary at the end.
      console.log('Session metadata update requested (skipping due to RLS lockdown):', updates);
    } catch (e) {
      console.error('Error updating session:', e);
    }
  }, []);

  const saveSummary = useCallback(async (sessionId: string, report: InsightReport) => {
    try {
      await supabase
        .from('feedback_summary')
        .insert({
          session_id: sessionId,
          top_bottlenecks: report.topBottlenecks,
          knowledge_concentration: report.knowledgeConcentration,
          must_have_integrations: report.mustHaveIntegrations,
          vision_score: report.visionScore,
          friction_score: report.frictionScore,
          key_themes: report.keyThemes,
        });

      // Note: We don't update sessions table to 'completed' anymore from client
      // because we've removed UPDATE permissions for security.
    } catch (e) {
      console.error('Error saving summary:', e);
    }
  }, []);

  const getAnswer = useCallback((chapter: number, key: string) => {
    return answers[chapter]?.[key];
  }, [answers]);

  const saveContacts = useCallback(async (sessionId: string, data: { consent: boolean; name?: string; email?: string }) => {
    try {
      await (supabase as any)
        .from('feedback_contacts')
        .insert({
          session_id: sessionId,
          consent: data.consent,
          contact_name: data.name,
          contact_email: data.email,
          contact_phone: (data as any).phone,
        });
    } catch (e) {
      console.error('Error saving contacts:', e);
    }
  }, []);

  return {
    session,
    answers,
    saving,
    createSession,
    saveAnswer,
    updateSession,
    saveSummary,
    saveContacts,
    getAnswer,
    setSession,
  };
}
