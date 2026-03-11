import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      feedback_sessions: {
        Row: {
          id: string;
          mode: 'fast' | 'deep';
          role: string | null;
          company_size_total: number | null;
          company_size_eng: number | null;
          hiring_volume: string | null;
          work_mode: string | null;
          persona_focus: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['feedback_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['feedback_sessions']['Insert']>;
      };
      feedback_answers: {
        Row: {
          id: string;
          session_id: string;
          chapter: number;
          question_key: string;
          answer: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['feedback_answers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['feedback_answers']['Insert']>;
      };
      feedback_summary: {
        Row: {
          id: string;
          session_id: string;
          top_bottlenecks: unknown[];
          knowledge_concentration: unknown[];
          must_have_integrations: unknown[];
          vision_score: number | null;
          friction_score: number | null;
          key_themes: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['feedback_summary']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['feedback_summary']['Insert']>;
      };
    };
  };
};
