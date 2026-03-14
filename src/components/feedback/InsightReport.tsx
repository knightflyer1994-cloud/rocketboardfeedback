import React, { useState } from 'react';
import type { InsightReport as InsightReportType, AllAnswers } from '@/types/feedback';
import { BOTTLENECK_CARDS, KNOWLEDGE_SOURCES, INTEGRATION_OPTIONS } from '@/types/feedback';
import { useExportFeedback } from '@/hooks/useExportFeedback';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Download, Mail, Loader2 } from 'lucide-react';

interface Props {
  report: InsightReportType;
  answers: AllAnswers;
  sessionId?: string;
  onRequestDemo: () => void;
}

function ScoreMeter({ score, max = 10, label }: { score: number; max?: number; label: string }) {
  const pct = (score / max) * 100;
  const color = score <= 3 ? 'hsl(var(--score-low))' : score <= 6 ? 'hsl(var(--score-mid))' : 'hsl(var(--score-high))';
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-2xl font-heading font-bold" style={{ color }}>
          {(score || 0).toFixed(1)}
          <span className="text-xs text-muted-foreground">/{max}</span>
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function buildReportEmail(report: InsightReportType, answers: AllAnswers): string {
  const ch1 = answers[1] || {};
  const roleLabels: Record<string, string> = {
    vpe: 'VP Engineering', cto: 'CTO', em: 'Eng Manager', staff: 'Staff Engineer',
    senior: 'Senior Engineer', director: 'Director of Eng', devex: 'DevEx / Platform', principal: 'Principal Engineer',
  };
  const role = roleLabels[ch1.role as string] || (ch1.role as string) || 'Engineering Leader';
  const frictionColor = (report.frictionScore || 0) <= 3 ? '#10b981' : (report.frictionScore || 0) <= 6 ? '#f59e0b' : '#ef4444';
  const topBots = report.topBottlenecks.slice(0, 3).map(id => BOTTLENECK_CARDS.find(c => c.id === id)?.label || id).join(', ');
  const topInts = report.mustHaveIntegrations.slice(0, 3).map(id => INTEGRATION_OPTIONS.find(i => i.id === id)?.label || id).join(', ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Your Engineering Onboarding Insight Report</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',system-ui,sans-serif;color:#e5e7eb;">
  <div style="max-width:640px;margin:0 auto;padding:0 16px 48px;">

    <!-- Top accent bar -->
    <div style="height:3px;background:linear-gradient(90deg,#6366f1,#06b6d4);border-radius:0 0 3px 3px;"></div>

    <!-- Header -->
    <div style="text-align:center;padding:40px 0 32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:999px;padding:6px 16px;margin-bottom:20px;">
        <span style="font-size:14px;color:#a5b4fc;font-weight:600;">✨ Your Insight Report is ready</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px;">
        Engineering Onboarding<br/>Analysis
      </h1>
      <p style="margin:0;color:#94a3b8;font-size:14px;">
        Personalized for <strong style="color:#e2e8f0;">${role}</strong>
        ${ch1.company_size_eng ? ` · ${ch1.company_size_eng} engineers` : ''}
      </p>
    </div>

    <!-- Score Cards -->
    <div style="display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;">
      <div style="flex:1;min-width:140px;background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:22px;margin-bottom:6px;">🔥</div>
        <div style="font-size:32px;font-weight:800;color:${frictionColor};">${(report.frictionScore || 0).toFixed(1)}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">Friction Score</div>
        <div style="font-size:10px;color:#475569;margin-top:2px;">out of 10</div>
      </div>
      <div style="flex:1;min-width:140px;background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:22px;margin-bottom:6px;">🎯</div>
        <div style="font-size:32px;font-weight:800;color:#6366f1;">${report.visionScore || '—'}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">Vision Fit</div>
        <div style="font-size:10px;color:#475569;margin-top:2px;">out of 10</div>
      </div>
      <div style="flex:1;min-width:140px;background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:20px;text-align:center;">
        <div style="font-size:22px;margin-bottom:6px;">📚</div>
        <div style="font-size:32px;font-weight:800;color:#06b6d4;">${(answers[4] as Record<string, unknown>)?.knowledge_sources ? ((answers[4] as Record<string, string[]>).knowledge_sources || []).length : 0}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-top:4px;">Knowledge Sources</div>
        <div style="font-size:10px;color:#475569;margin-top:2px;">tools mapped</div>
      </div>
    </div>

    <!-- Top Bottlenecks -->
    ${topBots ? `
    <div style="background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:24px;margin-bottom:20px;">
      <h2 style="margin:0 0 16px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">🚧 Your Top Bottlenecks</h2>
      ${report.topBottlenecks.slice(0, 3).map((id, idx) => {
        const card = BOTTLENECK_CARDS.find(c => c.id === id);
        if (!card) return '';
        const rankColors = ['#ef4444', '#f59e0b', '#6366f1'];
        return `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;${idx < 2 ? 'border-bottom:1px solid #1f2937;' : ''}">
          <div style="width:28px;height:28px;border-radius:50%;background:${rankColors[idx]};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;font-weight:800;color:white;text-align:center;line-height:28px;">${idx + 1}</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#e2e8f0;">${card.label}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px;">${card.desc}</div>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- Must-Have Integrations -->
    ${topInts ? `
    <div style="background:#1e1e2e;border:1px solid #2d2d3a;border-radius:12px;padding:24px;margin-bottom:20px;">
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;">🔌 Must-Have Integrations</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${report.mustHaveIntegrations.slice(0, 5).map((id, idx) => {
          const int = INTEGRATION_OPTIONS.find(i => i.id === id);
          if (!int) return '';
          return `<span style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:999px;padding:4px 12px;font-size:11px;color:#a5b4fc;font-weight:600;">${idx + 1}. ${int.label}</span>`;
        }).join('')}
      </div>
    </div>` : ''}

    <!-- CTA -->
    <div style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(6,182,212,0.1));border:1px solid rgba(99,102,241,0.3);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
      <div style="font-size:32px;margin-bottom:12px;">🚀</div>
      <h3 style="margin:0 0 8px;font-size:18px;font-weight:800;color:#f1f5f9;">Thank you for your insights</h3>
      <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;max-width:360px;margin-left:auto;margin-right:auto;">
        Your responses will directly shape how we build our platform. We'd love to show you an early demo.
      </p>
      <a href="mailto:hello@yourdomain.com?subject=Early Demo Request" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;font-size:13px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;">
        📅 Request an Early Demo
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid #1f2937;padding-top:20px;">
      <p style="color:#374151;font-size:11px;margin:0;">Engineering Onboarding Insights · Confidential Report</p>
      <p style="color:#374151;font-size:10px;margin:4px 0 0;">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

  </div>
</body>
</html>`;
}

export function InsightReport({ report, answers, sessionId, onRequestDemo }: Props) {
  const { generatePDF, generatePDFBase64 } = useExportFeedback();
  const [emailTarget, setEmailTarget] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const roleLabels: Record<string, string> = {
    vpe: 'VP Engineering', cto: 'CTO', em: 'Eng Manager', staff: 'Staff Engineer',
    senior: 'Senior Engineer', director: 'Director of Eng', devex: 'DevEx / Platform', principal: 'Principal Engineer',
  };

  const ch1 = answers[1] || {};
  const ch3 = answers[3] || {};
  const ch4 = answers[4] || {};

  const knowledgeSources = (ch4.knowledge_sources as string[]) || [];
  const sourceFreshness = (ch4.source_freshness as Record<string, string>) || {};
  const staleCount = Object.values(sourceFreshness).filter(v => v === 'stale').length;
  const fScore = report.frictionScore || 0;
  const frictionColor = fScore <= 3 ? 'hsl(var(--score-low))' : fScore <= 6 ? 'hsl(var(--score-mid))' : 'hsl(var(--score-high))';

  const handleDownloadPDF = () => {
    try {
      generatePDF(report, answers, sessionId);
      toast.success('PDF downloaded successfully');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleSendEmail = async () => {
    if (!emailTarget || !emailTarget.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSendingEmail(true);
    try {
      const html = buildReportEmail(report, answers);
      const pdfBase64 = generatePDFBase64(report, answers, sessionId);

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailTarget,
          subject: `Your Engineering Onboarding Insight Report`,
          html,
          attachments: [{
            filename: `onboarding-insight-report.pdf`,
            content: pdfBase64,
            type: 'application/pdf',
          }],
        },
      });

      if (error) throw error;
      toast.success(`Report sent to ${emailTarget}!`);
      setShowEmailForm(false);
      setEmailTarget('');
    } catch (e) {
      console.error(e);
      toast.error('Failed to send email. Check your Resend configuration.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="animate-scale-in space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
          ✨ Your Onboarding Insight Report
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          Engineering Onboarding Analysis
        </h1>
        {ch1.role && (
          <p className="text-muted-foreground">
            Personalized for <span className="text-foreground font-medium">{roleLabels[ch1.role as string] || ch1.role as string}</span>
            {ch1.company_size_eng ? ` · ${ch1.company_size_eng} engineers` : ''}
            {ch1.work_mode ? ` · ${(ch1.work_mode as string).replace('_', ' ')}` : ''}
          </p>
        )}
      </div>

      {/* Score cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">Friction Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-heading font-bold" style={{ color: frictionColor }}>
              {(report.frictionScore || 0).toFixed(1)}
            </span>
            <span className="text-muted-foreground mb-1">/10</span>
          </div>
          <p className="text-xs text-muted-foreground">Based on impact ratings and bottleneck severity</p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">Vision Fit</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-heading font-bold text-primary">{report.visionScore}</span>
            <span className="text-muted-foreground mb-1">/10</span>
          </div>
          <p className="text-xs text-muted-foreground">How well our platform addresses your challenges</p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <span className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">Knowledge Sources</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-heading font-bold text-accent">{knowledgeSources.length}</span>
            <span className="text-muted-foreground mb-1">tools</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {staleCount > 0 ? `${staleCount} marked as stale` : 'Across your knowledge ecosystem'}
          </p>
        </div>
      </div>

      {/* Top 3 Bottlenecks */}
      {report.topBottlenecks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-bold text-foreground">🚧 Your Top Bottlenecks</h2>
          <div className="space-y-3">
            {report.topBottlenecks.map((id, idx) => {
              const card = BOTTLENECK_CARDS.find(c => c.id === id);
              if (!card) return null;
              return (
                <div key={id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="w-8 h-8 rounded-full gradient-button flex items-center justify-center text-primary-foreground font-bold font-heading text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-2xl flex-shrink-0">{card.icon}</span>
                  <div>
                    <p className="font-heading font-semibold text-foreground">{card.label}</p>
                    <p className="text-xs text-muted-foreground">{card.desc}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      idx === 0 ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                      idx === 1 ? 'bg-score-mid/10 text-score-mid border border-score-mid/20' :
                      'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {idx === 0 ? '#1 Priority' : idx === 1 ? '#2 Priority' : '#3 Priority'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Knowledge Map */}
      {knowledgeSources.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-bold text-foreground">🗺️ Knowledge Map</h2>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex flex-wrap gap-2">
              {knowledgeSources.map(id => {
                const src = KNOWLEDGE_SOURCES.find(s => s.id === id);
                if (!src) return null;
                const freshness = sourceFreshness[id];
                return (
                  <div key={id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                    freshness === 'fresh' ? 'border-score-low/30 bg-score-low/10 text-foreground' :
                    freshness === 'stale' ? 'border-destructive/30 bg-destructive/10 text-foreground' :
                    'border-score-mid/30 bg-score-mid/10 text-foreground'
                  }`}>
                    <span>{src.icon}</span>
                    <span className="font-medium">{src.label}</span>
                    {freshness && (
                      <span className="text-xs opacity-70">
                        {freshness === 'fresh' ? '🟢' : freshness === 'stale' ? '🔴' : '🟡'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Must-have integrations */}
      {report.mustHaveIntegrations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-bold text-foreground">🔌 Must-Have Integrations</h2>
          <div className="flex flex-wrap gap-2">
            {report.mustHaveIntegrations.map((id, idx) => {
              const integration = INTEGRATION_OPTIONS.find(i => i.id === id);
              if (!integration) return null;
              return (
                <div key={id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                  <span>{integration.icon}</span>
                  <span className="font-medium text-foreground">{integration.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key themes */}
      {report.keyThemes && Object.keys(report.keyThemes).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-bold text-foreground">💡 Key Themes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.keyThemes.workMode && (
              <div className="p-3 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1">Work Model</p>
                <p className="text-sm font-medium text-foreground capitalize">{(report.keyThemes.workMode as string).replace('_', ' ')}</p>
              </div>
            )}
            {report.keyThemes?.productivityMetrics && (report.keyThemes.productivityMetrics as string[]).length > 0 && (
              <div className="p-3 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-1">Success Metrics</p>
                <p className="text-sm font-medium text-foreground">{(report.keyThemes.productivityMetrics as string[]).slice(0, 3).join(' · ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email form */}
      {showEmailForm && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-slide-in-up">
          <p className="text-sm font-heading font-semibold text-foreground">Send report to email</p>
          <p className="text-xs text-muted-foreground">A premium HTML summary + PDF audit log attachment will be delivered.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="you@company.com"
              value={emailTarget}
              onChange={e => setEmailTarget(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              onKeyDown={e => e.key === 'Enter' && handleSendEmail()}
            />
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-4 py-2 rounded-lg gradient-button text-primary-foreground text-sm font-heading font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
            </button>
            <button
              onClick={() => setShowEmailForm(false)}
              className="px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-secondary"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 text-center space-y-4">
        <div className="text-3xl">🚀</div>
        <h3 className="text-xl font-heading font-bold text-foreground">Thank you for your insights</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your responses will directly shape how we build our platform. We'd love to show you an early demo and hear your reaction.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={onRequestDemo}
            className="px-6 py-3 rounded-xl gradient-button text-primary-foreground font-heading font-semibold shadow-glow-primary hover:shadow-glow-accent transition-all"
          >
            📅 Request an Early Demo
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-3 rounded-xl border border-border bg-secondary text-foreground font-heading font-semibold hover:border-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
          <button
            onClick={() => setShowEmailForm(v => !v)}
            className="px-6 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary font-heading font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email This Report
          </button>
        </div>
      </div>
    </div>
  );
}
