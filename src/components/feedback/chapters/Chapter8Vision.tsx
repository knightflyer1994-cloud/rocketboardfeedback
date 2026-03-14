import React from 'react';
import { ChapterShell, SelectCard, SliderField, TextAreaField } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';

const VISION_TEXT = `We're building an AI-powered platform that connects to a company's existing knowledge sources (docs, code repos, chats, wikis), automatically organizes and keeps that knowledge fresh, creates personalized onboarding experiences and learning paths for new engineers, and provides grounded AI assistance so new hires can ask questions and get accurate answers based on the company's own data.`;

const EXCITEMENT_CARDS = [
  { id: 'time_savings', label: 'Massive time savings', icon: '⏱️' },
  { id: 'fresh_knowledge', label: 'Always-fresh knowledge', icon: '🌿' },
  { id: 'personalization', label: 'Personalized paths', icon: '🗺️' },
  { id: 'ai_qa', label: 'Grounded AI Q&A', icon: '🤖' },
  { id: 'analytics', label: 'Onboarding analytics', icon: '📊' },
  { id: 'mentor_scale', label: 'Scales mentorship', icon: '📈' },
];

const CONCERN_CARDS = [
  { id: 'data_privacy', label: 'Data privacy', icon: '🔒' },
  { id: 'ai_accuracy', label: 'AI accuracy / hallucinations', icon: '⚠️' },
  { id: 'adoption', label: 'Team adoption', icon: '😴' },
  { id: 'cost', label: 'Cost / ROI', icon: '💰' },
  { id: 'setup', label: 'Setup complexity', icon: '🔧' },
  { id: 'vendor_lock', label: 'Vendor lock-in', icon: '🔗' },
  { id: 'replaces_culture', label: 'Replaces human culture', icon: '🧑‍🤝‍🧑' },
];

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
  mode?: 'fast' | 'deep' | 'executive';
}

export function Chapter8Vision({ answers, onChange, mode }: Props) {
  const visionScore = (answers.vision_score as number) || 7;
  const excitements = (answers.excitements as string[]) || [];
  const concerns = (answers.concerns as string[]) || [];
  const missingText = (answers.missing_text as string) || '';
  const dealBreakers = (answers.deal_breakers as string) || '';
  const requireCitations = (answers.require_citations as number) || 8;
  const humanReview = (answers.human_review as number) || 7;
  const showSources = (answers.show_sources as number) || 8;

  const toggleExcitement = (id: string) => {
    const next = excitements.includes(id) ? excitements.filter(x => x !== id) : [...excitements, id];
    onChange('excitements', next);
  };

  const toggleConcern = (id: string) => {
    const next = concerns.includes(id) ? concerns.filter(x => x !== id) : [...concerns, id];
    onChange('concerns', next);
  };

  return (
    <ChapterShell
      title="Vision reaction"
      subtitle="We want your unfiltered take on what we're building."
    >
      {/* Vision block */}
      <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full gradient-progress" />
        <p className="text-sm text-muted-foreground leading-relaxed pl-3 italic">
          "{VISION_TEXT}"
        </p>
      </div>

      {/* ROI question — Executive only */}
      {mode === 'executive' && (
        <div className="p-5 rounded-xl bg-accent/10 border border-accent/20">
          <SliderField
            label="What is the potential ROI or strategic value of solving engineering ramp-up?"
            value={(answers.roi_value as number) || 7}
            onChange={v => onChange('roi_value', v)}
            leftLabel="Marginal / Nice-to-have"
            rightLabel="Strategic / Bottom-line impact"
            description="How much do you value solving this problem from a business perspective?"
          />
        </div>
      )}

      {/* Vision score */}
      <div className="p-5 rounded-xl bg-secondary/50 border border-border">
        <SliderField
          label="How well does this vision address the onboarding challenges you experience?"
          value={visionScore}
          onChange={v => onChange('vision_score', v)}
          leftLabel="Misses the mark"
          rightLabel="Exactly what we need"
          colorByValue
          description="Be honest — a low score is more valuable than a polite high one."
        />
      </div>

      {/* Excitement cards */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">
          What excites you most? <span className="text-muted-foreground font-normal">(pick all that apply)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EXCITEMENT_CARDS.map(c => (
            <SelectCard
              key={c.id}
              icon={c.icon}
              label={c.label}
              size="sm"
              selected={excitements.includes(c.id)}
              onClick={() => toggleExcitement(c.id)}
            />
          ))}
        </div>
      </div>

      {/* Concern cards */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">
          What concerns you? <span className="text-muted-foreground font-normal">(pick all that apply)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CONCERN_CARDS.map(c => (
            <SelectCard
              key={c.id}
              icon={c.icon}
              label={c.label}
              size="sm"
              selected={concerns.includes(c.id)}
              onClick={() => toggleConcern(c.id)}
            />
          ))}
        </div>
      </div>

      {/* AI trust probes */}
      <div className="space-y-5 p-5 rounded-xl bg-secondary/50 border border-border">
        <h3 className="text-base font-heading font-semibold text-foreground">AI trust signals</h3>
        <SliderField
          label="Require citations / source links for AI-generated answers?"
          value={requireCitations}
          onChange={v => onChange('require_citations', v)}
          leftLabel="Not necessary"
          rightLabel="Absolutely required"
        />
        <SliderField
          label="Human review layer before AI content is surfaced to new hires?"
          value={humanReview}
          onChange={v => onChange('human_review', v)}
          leftLabel="Fully automated"
          rightLabel="Always human-reviewed"
        />
        <SliderField
          label="Transparency: show source spans / highlight what the answer is based on?"
          value={showSources}
          onChange={v => onChange('show_sources', v)}
          leftLabel="Clean answer only"
          rightLabel="Always show evidence"
        />
      </div>

      {/* Conditional deeper probe */}
      {visionScore <= 6 && (
        <TextAreaField
          label="What's missing from this vision that would make it more compelling?"
          value={missingText}
          onChange={v => onChange('missing_text', v)}
          placeholder="e.g. You haven't mentioned how to handle legacy tribal knowledge, or the social onboarding aspect..."
          rows={4}
        />
      )}

      <TextAreaField
        label="Any absolute deal-breakers that would prevent you from adopting this?"
        value={dealBreakers}
        onChange={v => onChange('deal_breakers', v)}
        placeholder="e.g. Must be SOC2 certified, can't use OpenAI, must have on-prem option..."
        rows={3}
      />
    </ChapterShell>
  );
}
