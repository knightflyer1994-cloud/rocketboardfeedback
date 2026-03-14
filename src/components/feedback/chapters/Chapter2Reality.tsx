import React from 'react';
import { ChapterShell, SelectCard, SliderField, TextAreaField } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';

const PRODUCTIVITY_METRICS = [
  { id: 'first_pr', label: 'First PR merged', icon: '🔀' },
  { id: 'first_feature', label: 'First feature shipped', icon: '🚢' },
  { id: 'oncall', label: 'On-call ready', icon: '📟' },
  { id: 'code_review', label: 'Code reviewing peers', icon: '👁️' },
  { id: 'autonomous', label: 'Fully autonomous delivery', icon: '🦅' },
  { id: 'arch_understanding', label: 'Architecture mastery', icon: '🗺️' },
  { id: 'cultural_fit', label: 'Cultural integration', icon: '🤝' },
  { id: 'no_hand_holding', label: 'No daily hand-holding', icon: '🆓' },
];

const TIMELINE_PHASES = [
  { key: 'access_setup', label: 'Access & Setup', color: 'hsl(252 85% 65%)' },
  { key: 'architecture', label: 'Architecture Learning', color: 'hsl(187 90% 55%)' },
  { key: 'first_tasks', label: 'First Tasks', color: 'hsl(142 72% 50%)' },
  { key: 'independent', label: 'Independent Delivery', color: 'hsl(38 92% 55%)' },
  { key: 'oncall_culture', label: 'On-call / Culture', color: 'hsl(0 72% 65%)' },
];

const SUPPORT_MODELS = [
  { id: 'buddy', label: 'Buddy system', icon: '👯' },
  { id: 'manager', label: 'Manager-led', icon: '👔' },
  { id: 'team', label: 'Whole-team', icon: '👥' },
  { id: 'self_serve', label: 'Self-serve', icon: '🗺️' },
  { id: 'mixed', label: 'Mixed / varies', icon: '🔀' },
];

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
  mode: 'fast' | 'deep' | 'executive';
}

export function Chapter2Reality({ answers, onChange, mode }: Props) {
  const productivity = (answers.productivity_metrics as string[]) || [];
  const timeline = (answers.timeline as Record<string, number>) || {
    access_setup: 20, architecture: 25, first_tasks: 20, independent: 20, oncall_culture: 15,
  };
  const supportModel = answers.support_model as string | undefined;
  const cultureSlider = (answers.culture_importance as number) || 5;
  const cultureText = (answers.culture_text as string) || '';

  const timelineTotal = Object.values(timeline).reduce((a, b) => a + b, 0);

  const toggleProductivity = (id: string) => {
    const next = productivity.includes(id)
      ? productivity.filter(x => x !== id)
      : [...productivity, id];
    onChange('productivity_metrics', next);
  };

  const updateTimeline = (key: string, val: number) => {
    onChange('timeline', { ...timeline, [key]: val });
  };

  return (
    <ChapterShell
      title="Reality check: what does good look like?"
      subtitle="Help us understand how you measure onboarding success and where time actually goes."
    >
      {/* Productivity definition */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">
          How do you define "productive" for a new hire? <span className="text-muted-foreground font-normal">(pick all that apply)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRODUCTIVITY_METRICS.map(m => (
            <SelectCard
              key={m.id}
              icon={m.icon}
              label={m.label}
              size="sm"
              selected={productivity.includes(m.id)}
              onClick={() => toggleProductivity(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Timeline allocator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-heading font-semibold text-foreground">
            Where does onboarding time <em>actually</em> go?
          </h3>
          <span className={`text-sm font-heading font-bold ${timelineTotal === 100 ? 'text-score-low' : timelineTotal > 100 ? 'text-destructive' : 'text-score-mid'}`}>
            {timelineTotal}% / 100%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Adjust the sliders — they should sum to 100%. This helps us understand ramp-up topology.</p>
        <div className="space-y-4 p-4 rounded-xl bg-secondary/50 border border-border">
          {TIMELINE_PHASES.map(phase => (
            <div key={phase.key} className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">{phase.label}</label>
                <span className="text-sm font-bold font-heading" style={{ color: phase.color }}>
                  {timeline[phase.key] || 0}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={timeline[phase.key] || 0}
                onChange={e => updateTimeline(phase.key, Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, ${phase.color} 0%, ${phase.color} ${timeline[phase.key] || 0}%, hsl(var(--secondary)) ${timeline[phase.key] || 0}%, hsl(var(--secondary)) 100%)`
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Human support model */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">What's your primary human support model?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SUPPORT_MODELS.map(s => (
            <SelectCard
              key={s.id}
              icon={s.icon}
              label={s.label}
              size="sm"
              selected={supportModel === s.id}
              onClick={() => onChange('support_model', s.id)}
            />
          ))}
        </div>
      </div>

      {/* Culture slider — Deep Dive only */}
      {mode === 'deep' && (
        <div className="space-y-4 p-4 rounded-xl bg-secondary/50 border border-border">
          <SliderField
            label="How much should a platform help with social connection, company values, and reducing isolation?"
            value={cultureSlider}
            onChange={v => onChange('culture_importance', v)}
            leftLabel="Pure technical content"
            rightLabel="Strong social/cultural focus"
            description="1 = purely technical, 10 = culture and human connection are equally critical"
          />
          <TextAreaField
            label="What would 'great' culture integration look like in an onboarding tool?"
            value={cultureText}
            onChange={v => onChange('culture_text', v)}
            placeholder="e.g. Slack intros to key people, team rituals guide, 'unwritten rules' doc..."
            rows={3}
          />
        </div>
      )}
    </ChapterShell>
  );
}
