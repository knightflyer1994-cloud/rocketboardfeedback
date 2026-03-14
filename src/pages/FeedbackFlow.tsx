import React, { useState, useCallback } from 'react';
import { ProgressBar } from '@/components/feedback/ProgressBar';
import { Chapter1Snapshot } from '@/components/feedback/chapters/Chapter1Snapshot';
import { Chapter2Reality } from '@/components/feedback/chapters/Chapter2Reality';
import { Chapter3Bottlenecks } from '@/components/feedback/chapters/Chapter3Bottlenecks';
import { Chapter4Knowledge } from '@/components/feedback/chapters/Chapter4Knowledge';
import { Chapter5Integrations } from '@/components/feedback/chapters/Chapter5Integrations';
import { Chapter6Services } from '@/components/feedback/chapters/Chapter6Services';
import { Chapter7Competitive } from '@/components/feedback/chapters/Chapter7Competitive';
import { Chapter8Vision } from '@/components/feedback/chapters/Chapter8Vision';
import { Chapter9Adoption } from '@/components/feedback/chapters/Chapter9Adoption';
import { Chapter10Closing } from '@/components/feedback/chapters/Chapter10Closing';
import { InsightReport } from '@/components/feedback/InsightReport';
import { useFeedbackSession } from '@/hooks/useFeedbackSession';
import type { FlowMode, InsightReport as InsightReportType, ChapterAnswers } from '@/types/feedback';
import { CHAPTERS_FAST, CHAPTERS_DEEP, CHAPTERS_EXECUTIVE, BOTTLENECK_CARDS, INTEGRATION_OPTIONS } from '@/types/feedback';
import { cn } from '@/lib/utils';

const VISION_TEXT = `We're building an AI-powered platform that connects to a company's existing knowledge sources (docs, code repos, chats, wikis), automatically organizes and keeps that knowledge fresh, creates personalized onboarding experiences and learning paths for new engineers, and provides grounded AI assistance so new hires can ask questions and get accurate answers based on the company's own data.`;

const ROLE_LABELS: Record<string, string> = {
  vpe: 'VP Engineering', cto: 'CTO', em: 'Engineering Manager', staff: 'Staff Engineer',
  senior: 'Senior Engineer', director: 'Director of Engineering', devex: 'DevEx / Platform Lead', principal: 'Principal Engineer',
};

type Stage = 'welcome' | 'mode' | 'flow' | 'report';

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full space-y-8 animate-slide-in-up">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-2">
            🚀 Engineering Onboarding Research
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground leading-tight">
            Onboarding Insights
          </h1>
          <p className="text-accent text-lg font-heading font-medium">Shaping the future of engineering ramp-up</p>
        </div>

        <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full gradient-progress" />
          <p className="text-muted-foreground leading-relaxed text-sm pl-3">
            {VISION_TEXT}
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
          <p className="text-foreground leading-relaxed">
            We're in early stages building an AI-enhanced onboarding platform for engineering teams and would value your perspective. <span className="text-primary font-medium">This will take ~20 minutes.</span>
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="text-score-low">🔒</span>
            Responses are fully confidential and used only in aggregate to guide product direction.
          </p>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 rounded-xl gradient-button text-primary-foreground font-heading font-bold text-lg shadow-glow-primary hover:shadow-glow-accent transition-all duration-300"
        >
          Get Started →
        </button>
      </div>
    </div>
  );
}

function ModeSelector({ onSelect }: { onSelect: (mode: FlowMode) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-2xl w-full space-y-8 animate-slide-in-up">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-heading font-bold text-foreground">Choose your path</h2>
          <p className="text-muted-foreground">Both paths are equally valuable — pick what fits your schedule.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Executive Path */}
          <button
            onClick={() => onSelect('executive')}
            className="group text-left p-6 rounded-2xl border border-accent/30 bg-accent/5 hover:border-accent/60 hover:shadow-glow-accent transition-all duration-300 space-y-4 relative"
          >
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/30">
              New
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🚀
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground group-hover:text-accent transition-colors">Executive Path</h3>
              <p className="text-accent text-sm font-medium mt-1">3–4 minutes</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              High-level strategic pulse. Focuses on business impact, vision fit, and key organizational challenges. Best for Founders and Directors.
            </p>
            <div className="flex flex-wrap gap-1">
              {['Snapshot', 'Challenges', 'Vision', 'Closing'].map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-accent/10 text-xs text-accent/80">{t}</span>
              ))}
            </div>
            <div className="w-full py-2.5 rounded-xl border border-accent/40 bg-accent/10 text-accent text-sm font-heading font-semibold text-center group-hover:bg-accent/20 transition-colors">
              Choose Executive Path →
            </div>
          </button>

          {/* Fast Track */}
          <button
            onClick={() => onSelect('fast')}
            className="group text-left p-6 rounded-2xl border border-border bg-card hover:border-accent/50 hover:shadow-glow-accent transition-all duration-300 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground group-hover:text-accent transition-colors">Fast Track</h3>
              <p className="text-accent text-sm font-medium mt-1">8–10 minutes</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Core high-signal questions. Covers the key bottlenecks, integrations, and vision reaction. Best if you're short on time.
            </p>
            <div className="flex flex-wrap gap-1">
              {['Snapshot', 'Bottlenecks', 'Knowledge', 'Vision', 'Closing'].map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">{t}</span>
              ))}
            </div>
            <div className="w-full py-2.5 rounded-xl border border-accent/40 bg-accent/10 text-accent text-sm font-heading font-semibold text-center group-hover:bg-accent/20 transition-colors">
              Choose Fast Track →
            </div>
          </button>

          {/* Deep Dive */}
          <button
            onClick={() => onSelect('deep')}
            className="group text-left p-6 rounded-2xl border border-primary/30 bg-primary/5 hover:border-primary/60 hover:shadow-glow-primary transition-all duration-300 space-y-4 relative"
          >
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
              Recommended
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🔭
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors">Deep Dive</h3>
              <p className="text-primary text-sm font-medium mt-1">18–22 minutes</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full detailed journey with branching questions, competitive landscape, and richer personalization based on your role.
            </p>
            <div className="flex flex-wrap gap-1">
              {['Snapshot', 'Reality', 'Bottlenecks', 'Knowledge', 'Integrations', 'Services', 'Competitive', 'Vision', 'Adoption', 'Closing'].map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-xs text-primary/80">{t}</span>
              ))}
            </div>
            <div className="w-full py-2.5 rounded-xl gradient-button text-primary-foreground text-sm font-heading font-semibold text-center">
              Choose Deep Dive →
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function computeReport(answers: Record<number, ChapterAnswers>): InsightReportType {
  const ch1 = answers[1] || {};
  const ch2 = answers[2] || {};
  const ch3 = answers[3] || {};
  const ch4 = answers[4] || {};
  const ch5 = answers[5] || {};
  const ch8 = answers[8] || {};

  const impacts = (ch3.impacts as Record<string, number>) || {};
  const impactValues = Object.values(impacts);
  const avgImpact = impactValues.length > 0
    ? impactValues.reduce((a, b) => a + b, 0) / impactValues.length
    : 5;

  const ranked = (ch3.ranked_bottlenecks as string[]) || [];
  const selected = (ch3.selected_bottlenecks as string[]) || [];
  const topBottlenecks = ranked.length > 0 ? ranked : selected.slice(0, 3);

  const bottleneckSeverity = topBottlenecks.length * 1.5;
  const frictionScore = Math.min(10, Math.round(((avgImpact * 0.6 + bottleneckSeverity * 0.4)) * 10) / 10);

  const sourceFreshness = (ch4.source_freshness as Record<string, string>) || {};
  const staleSources = Object.entries(sourceFreshness)
    .filter(([, v]) => v === 'stale')
    .map(([k]) => k);
  const knowledgeConcentration = staleSources.length > 0 ? staleSources : (ch4.knowledge_sources as string[] || []).slice(0, 3);

  const mustHaveIntegrations = (ch5.ranked_integrations as string[]) || (ch5.selected_integrations as string[] || []).slice(0, 5);
  const visionScore = (ch8.vision_score as number) || 7;

  return {
    topBottlenecks,
    knowledgeConcentration,
    mustHaveIntegrations,
    visionScore,
    frictionScore,
    keyThemes: {
      role: ch1.role as string,
      companySize: ch1.company_size_eng ? `${ch1.company_size_eng} engineers` : undefined,
      workMode: ch1.work_mode as string,
      productivityMetrics: ch2.productivity_metrics as string[],
    },
  };
}

export default function FeedbackFlow() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [mode, setMode] = useState<FlowMode>('fast');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [report, setReport] = useState<InsightReportType | null>(null);

  const { session, answers, createSession, saveAnswer, updateSession, saveSummary } = useFeedbackSession();

  const chapters = mode === 'deep' ? CHAPTERS_DEEP : mode === 'fast' ? CHAPTERS_FAST : CHAPTERS_EXECUTIVE;

  const chapterAnswers = answers[currentChapter] || {};

  const handleChange = useCallback(async (key: string, value: unknown) => {
    if (!session) return;
    await saveAnswer(session.id, currentChapter, key, value);
  }, [session, currentChapter, saveAnswer]);

  const handleModeSelect = async (selectedMode: FlowMode) => {
    setMode(selectedMode);
    const newSession = await createSession(selectedMode);
    if (newSession) {
      setStage('flow');
      setCurrentChapter(chapters[0]?.id || 1);
    }
  };

  const handleNext = () => {
    const idx = chapters.findIndex(c => c.id === currentChapter);
    if (idx < chapters.length - 1) {
      setCurrentChapter(chapters[idx + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    const idx = chapters.findIndex(c => c.id === currentChapter);
    if (idx > 0) {
      setCurrentChapter(chapters[idx - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    const computed = computeReport(answers);
    if (session) {
      await saveSummary(session.id, computed);
    }
    setReport(computed);
    setStage('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFirstChapter = chapters.findIndex(c => c.id === currentChapter) === 0;
  const isLastChapter = chapters.findIndex(c => c.id === currentChapter) === chapters.length - 1;

  if (stage === 'welcome') return <WelcomeScreen onStart={() => setStage('mode')} />;
  if (stage === 'mode') return <ModeSelector onSelect={handleModeSelect} />;

  if (stage === 'report' && report) {
    return (
      <div className="min-h-screen px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <InsightReport
            report={report}
            answers={answers}
            onRequestDemo={() => alert('Thank you! We\'ll be in touch soon.')}
          />
        </div>
      </div>
    );
  }

  const renderChapter = () => {
    const props = { answers: chapterAnswers, onChange: handleChange, mode };
    switch (currentChapter) {
      case 1: return <Chapter1Snapshot {...props} />;
      case 2: return <Chapter2Reality {...props} />;
      case 3: return <Chapter3Bottlenecks answers={chapterAnswers} onChange={handleChange} mode={mode} />;
      case 4: return <Chapter4Knowledge answers={chapterAnswers} onChange={handleChange} />;
      case 5: return <Chapter5Integrations answers={chapterAnswers} onChange={handleChange} />;
      case 6: return <Chapter6Services answers={chapterAnswers} onChange={handleChange} />;
      case 7: return <Chapter7Competitive answers={chapterAnswers} onChange={handleChange} />;
      case 8: return <Chapter8Vision answers={chapterAnswers} onChange={handleChange} mode={mode} />;
      case 9: return <Chapter9Adoption answers={chapterAnswers} onChange={handleChange} />;
      case 10: return <Chapter10Closing answers={chapterAnswers} onChange={handleChange} onComplete={handleComplete} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ProgressBar mode={mode} currentChapter={currentChapter} />

      <div className="max-w-3xl mx-auto px-4 pt-28 pb-24">
        {renderChapter()}

        {/* Navigation — skip for chapter 10 which has its own submit */}
        {!isLastChapter && (
          <div className="flex justify-between items-center pt-10 border-t border-border mt-10">
            <button
              onClick={handlePrev}
              disabled={isFirstChapter}
              className="px-5 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-medium hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Back
            </button>
            <span className="text-xs text-muted-foreground">
              Chapter {chapters.findIndex(c => c.id === currentChapter) + 1} of {chapters.length}
            </span>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl gradient-button text-primary-foreground text-sm font-heading font-semibold shadow-glow-primary hover:shadow-glow-accent transition-all"
            >
              Continue →
            </button>
          </div>
        )}
        {isLastChapter && !isFirstChapter && (
          <div className="pt-4">
            <button
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-medium hover:border-primary/30 transition-all"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
