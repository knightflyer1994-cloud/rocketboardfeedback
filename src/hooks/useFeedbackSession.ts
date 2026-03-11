import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { SessionData, AllAnswers, InsightReport } from '@/types/feedback';

export function useFeedbackSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [answers, setAnswers] = useState<AllAnswers>({});
  const [saving, setSaving] = useState(false);

  const createSession = useCallback(async (mode: 'fast' | 'deep') => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('feedback_sessions')
        .insert({ mode, completed: false })
        .select()
        .single();
      if (error) throw error;
      const newSession: SessionData = { id: data.id, mode };
      setSession(newSession);
      return newSession;
    } catch (e) {
      console.error('Error creating session:', e);
      // Create local fallback
      const localSession: SessionData = { id: crypto.randomUUID(), mode };
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
        .upsert({
          session_id: sessionId,
          chapter,
          question_key: questionKey,
          answer: { value },
        }, { onConflict: 'session_id,chapter,question_key' });
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
      await supabase
        .from('feedback_sessions')
        .update(dbUpdates)
        .eq('id', sessionId);
    } catch (e) {
      console.error('Error updating session:', e);
    }
  }, []);

  const saveSummary = useCallback(async (sessionId: string, report: InsightReport) => {
    try {
      await supabase
        .from('feedback_summary')
        .upsert({
          session_id: sessionId,
          top_bottlenecks: report.topBottlenecks,
          knowledge_concentration: report.knowledgeConcentration,
          must_have_integrations: report.mustHaveIntegrations,
          vision_score: report.visionScore,
          friction_score: report.frictionScore,
          key_themes: report.keyThemes,
        }, { onConflict: 'session_id' });

      await supabase
        .from('feedback_sessions')
        .update({ completed: true })
        .eq('id', sessionId);
    } catch (e) {
      console.error('Error saving summary:', e);
    }
  }, []);

  const getAnswer = useCallback((chapter: number, key: string) => {
    return answers[chapter]?.[key];
  }, [answers]);

  return {
    session,
    answers,
    saving,
    createSession,
    saveAnswer,
    updateSession,
    saveSummary,
    getAnswer,
    setSession,
  };
}
