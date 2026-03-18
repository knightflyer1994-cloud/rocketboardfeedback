import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InsightReport } from '@/components/feedback/InsightReport';
import { InsightReport as InsightReportType, AllAnswers } from '@/types/feedback';
import { ChevronLeft, Download, Filter, Search, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Submission {
  id: string;
  created_at: string;
  mode: string;
  role: string | null;
  company_size_eng: number | null;
  completed: boolean;
  summary?: InsightReportType | null;
}

/** Map DB snake_case row → InsightReportType (camelCase) */
function mapSummary(summary: any): InsightReportType | undefined {
  if (!summary) return undefined;
  
  // feedback_summary is 1:1, but Supabase may return it as an array if not configured as such
  const s = Array.isArray(summary) ? summary[0] : summary;
  if (!s) return undefined;

  return {
    ...s,
    frictionScore: s.friction_score ?? 0,
    visionScore: s.vision_score ?? 0,
    topBottlenecks: s.top_bottlenecks || [],
    mustHaveIntegrations: s.must_have_integrations || [],
    knowledgeConcentration: s.knowledge_concentration || [],
    keyThemes: s.key_themes || {}
  };
}

export default function Results() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailedAnswers, setDetailedAnswers] = useState<AllAnswers>({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/login');
    }
  }

  async function fetchSubmissions() {
    try {
      const { data: sessions, error } = await supabase
        .from('feedback_sessions')
        .select(`
          *,
          summary:feedback_summary(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedSessions = (sessions || []).map((s: any) => {
        const summary = mapSummary(s.summary);
        return {
          ...s,
          role: s.role || (summary?.keyThemes as any)?.role || 'Unknown Role',
          summary
        };
      });

      setSubmissions(mappedSessions as any);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }

  async function fetchFullSubmission(id: string) {
    try {
      const { data: answers, error } = await supabase
        .from('feedback_answers')
        .select('*')
        .eq('session_id', id);

      if (error) throw error;

      const formattedAnswers: AllAnswers = {};
      answers.forEach(a => {
        formattedAnswers[a.chapter] = {
          ...(formattedAnswers[a.chapter] || {}),
          [a.question_key]: (a.answer as any)?.value
        };
      });

      setDetailedAnswers(formattedAnswers);
      setSelectedId(id);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Failed to load report details');
    }
  }

  async function deleteSubmission(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await supabase.from('feedback_sessions').delete().eq('id', id);
      if (error) throw error;
      setSubmissions(prev => prev.filter(s => s.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast.success('Submission deleted');
    } catch (error) {
      toast.error('Failed to delete submission');
    }
  }

  const filteredSubmissions = submissions.filter(s => 
    (s.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.mode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const selectedSubmission = submissions.find(s => s.id === selectedId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </a>
            <h1 className="text-2xl font-heading font-bold">Feedback Insights Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button 
              disabled 
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-muted-foreground cursor-not-allowed opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List Sidebar */}
          <div className={cn(
            "lg:col-span-4 space-y-4",
            selectedId && "hidden lg:block"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search by role or path..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">No submissions found</p>
                </div>
              ) : (
                filteredSubmissions.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => fetchFullSubmission(s.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer group",
                      selectedId === s.id 
                        ? "border-primary/50 bg-primary/5 shadow-glow-primary" 
                        : "border-border bg-card hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        s.mode === 'executive' ? "bg-accent/20 text-accent" : 
                        s.mode === 'fast' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                      )}>
                        {s.mode} path
                      </span>
                      <button 
                        onClick={(e) => deleteSubmission(s.id, e)}
                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-heading font-semibold text-foreground truncate">
                      {s.role}
                    </h3>
                    <div className="flex justify-between items-end mt-2">
                       <p className="text-xs text-muted-foreground italic">
                        {format(new Date(s.created_at), 'MMM d, h:mm a')}
                      </p>
                      {s.summary && s.summary.frictionScore !== undefined && (
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Friction</p>
                          <p className={cn(
                            "font-heading font-bold",
                            (s.summary.frictionScore || 0) <= 3 ? "text-score-low" : 
                            (s.summary.frictionScore || 0) <= 6 ? "text-score-mid" : "text-score-high"
                          )}>
                            {(s.summary.frictionScore || 0).toFixed(1)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Report Detail View */}
          <div className={cn(
            "lg:col-span-8",
            !selectedId && "hidden lg:flex items-center justify-center border border-dashed border-border rounded-2xl bg-card/30"
          )}>
            {!selectedId ? (
              <div className="text-center space-y-4 p-12">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-heading font-semibold">Select a submission to view insights</h2>
                <p className="text-muted-foreground max-w-xs mx-auto">Select a participant from the left to drill down into their specific onboarding challenges and report.</p>
              </div>
            ) : (
              <div className="animate-slide-in-right space-y-6">
                <div className="lg:hidden mb-4">
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to list
                  </button>
                </div>

                {selectedSubmission?.summary ? (
                  <div className="max-h-[calc(100vh-100px)] overflow-y-auto pr-4 custom-scrollbar">
                    <InsightReport 
                      report={selectedSubmission.summary} 
                      answers={detailedAnswers}
                      sessionId={selectedId}
                      onRequestDemo={async () => {
                        toast.promise(
                          supabase.functions.invoke('send-email', {
                            body: {
                              subject: `🚨 DEMO REQUEST: ${selectedSubmission.summary?.keyThemes?.role || 'Participant'}`,
                              html: `
                                <div style="font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:40px;border-radius:12px;border:1px solid #1e293b;">
                                  <h1 style="color:#6366f1;margin:0 0 16px;">New Demo Request!</h1>
                                  <p style="font-size:16px;color:#94a3b8;">A participant has requested an early demo after completing their onboarding feedback.</p>
                                  
                                  <div style="background:#1e293b;border-radius:8px;padding:20px;margin:24px 0;">
                                    <p style="margin:0 0 8px;"><strong>Role:</strong> ${selectedSubmission.summary?.keyThemes?.role || 'Unknown'}</p>
                                    <p style="margin:0 0 8px;"><strong>Company Size:</strong> ${selectedSubmission.summary?.keyThemes?.companySize || 'Unknown'}</p>
                                    <p style="margin:0;"><strong>Report ID:</strong> ${selectedId}</p>
                                  </div>

                                  <a href="${window.location.origin}/results" 
                                     style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
                                    View Full Insight Report →
                                  </a>
                                </div>
                              `,
                              is_admin_alert: true
                            }
                          }),
                          {
                            loading: 'Sending request...',
                            success: 'Demo request sent!',
                            error: 'Failed to send request.'
                          }
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-12 text-center border border-border bg-card rounded-2xl">
                    <p className="text-muted-foreground">No insight report generated for this session.</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
