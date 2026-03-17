import React, { useState } from 'react';
import type { InsightReport as InsightReportType, AllAnswers } from '@/types/feedback';
import { BOTTLENECK_CARDS, KNOWLEDGE_SOURCES, INTEGRATION_OPTIONS } from '@/types/feedback';
import { useExportFeedback } from '@/hooks/useExportFeedback';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';

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

export function InsightReport({ report, answers, sessionId, onRequestDemo }: Props) {
  const { generatePDF } = useExportFeedback();

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


  const topBottlenecks = report.topBottlenecks || [];
  const mustHaveIntegrations = report.mustHaveIntegrations || [];

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
            <span className="text-5xl font-heading font-bold text-primary">{report.visionScore ?? 0}</span>
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
      {topBottlenecks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-bold text-foreground">🚧 Your Top Bottlenecks</h2>
          <div className="space-y-3">
            {topBottlenecks.map((id, idx) => {
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
      {mustHaveIntegrations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-heading font-bold text-foreground">🔌 Must-Have Integrations</h2>
          <div className="flex flex-wrap gap-2">
            {mustHaveIntegrations.map((id, idx) => {
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
        </div>
      </div>
    </div>
  );
}
