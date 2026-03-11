import React, { useState } from 'react';
import { ChapterShell, SelectCard, SliderField, TextAreaField, RankedCard } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';
import { OUTCOME_CARDS } from '@/types/feedback';

const ONBOARDING_VIEW = [
  { id: 'one_time', label: 'One-time event', icon: '🎯', desc: 'Onboarding ends at week 4–8' },
  { id: 'ongoing', label: 'Ongoing journey', icon: '♾️', desc: 'Continuous learning + mentorship for 12+ months' },
  { id: 'mixed', label: 'Formal start, then self-serve', icon: '🔀', desc: 'Structured onboarding, then informal learning' },
];

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
}

export function Chapter6Services({ answers, onChange }: Props) {
  const [draggedFrom, setDraggedFrom] = useState<number | null>(null);

  const selectedOutcomes = (answers.selected_outcomes as string[]) || [];
  const rankedOutcomes = (answers.ranked_outcomes as string[]) || [];
  const onboardingView = answers.onboarding_view as string | undefined;
  const postMonth1 = (answers.post_month1 as string) || '';
  const aiVsHuman = (answers.ai_vs_human as number) || 5;

  const toggleOutcome = (id: string) => {
    const next = selectedOutcomes.includes(id)
      ? selectedOutcomes.filter(x => x !== id)
      : [...selectedOutcomes, id];
    onChange('selected_outcomes', next);
    if (selectedOutcomes.includes(id)) {
      onChange('ranked_outcomes', rankedOutcomes.filter(x => x !== id));
    }
  };

  const addToRanked = (id: string) => {
    if (rankedOutcomes.length >= 5) return;
    if (!rankedOutcomes.includes(id)) {
      onChange('ranked_outcomes', [...rankedOutcomes, id]);
    }
  };

  const removeFromRanked = (id: string) => {
    onChange('ranked_outcomes', rankedOutcomes.filter(x => x !== id));
  };

  const handleDragStart = (idx: number) => setDraggedFrom(idx);
  const handleDrop = (toIdx: number) => {
    if (draggedFrom === null || draggedFrom === toIdx) return;
    const newRanked = [...rankedOutcomes];
    const [moved] = newRanked.splice(draggedFrom, 1);
    newRanked.splice(toIdx, 0, moved);
    onChange('ranked_outcomes', newRanked);
    setDraggedFrom(null);
  };

  return (
    <ChapterShell
      title="Ideal platform services"
      subtitle="If you could design the perfect onboarding platform, what outcomes would it deliver?"
    >
      {/* Outcome cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-heading font-semibold text-foreground">Which capabilities matter most?</h3>
          <p className="text-sm text-muted-foreground mt-1">Select all that resonate, then rank your top 5.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OUTCOME_CARDS.map(card => (
            <div key={card.id} className="group relative">
              <SelectCard
                icon={card.icon}
                label={card.label}
                desc={card.desc}
                size="sm"
                selected={selectedOutcomes.includes(card.id)}
                onClick={() => toggleOutcome(card.id)}
              />
              {selectedOutcomes.includes(card.id) && !rankedOutcomes.includes(card.id) && rankedOutcomes.length < 5 && (
                <button
                  onClick={() => addToRanked(card.id)}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                >
                  Add to top 5
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Ranked top 5 */}
        {selectedOutcomes.length > 0 && (
          <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-heading font-semibold text-foreground">Your top 5 priorities (drag to reorder)</h4>
              <span className="text-xs text-muted-foreground">{rankedOutcomes.length}/5</span>
            </div>
            {rankedOutcomes.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Hover a selected card and click "Add to top 5"</p>
            )}
            {rankedOutcomes.map((id, idx) => {
              const card = OUTCOME_CARDS.find(c => c.id === id);
              if (!card) return null;
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(idx)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <RankedCard
                    rank={idx + 1}
                    icon={card.icon}
                    label={card.label}
                    onRemove={() => removeFromRanked(id)}
                  />
                </div>
              );
            })}

            {selectedOutcomes.filter(id => !rankedOutcomes.includes(id)).length > 0 && rankedOutcomes.length < 5 && (
              <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                {selectedOutcomes.filter(id => !rankedOutcomes.includes(id)).map(id => {
                  const card = OUTCOME_CARDS.find(c => c.id === id);
                  if (!card) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => addToRanked(id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all"
                    >
                      {card.icon} {card.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Continuous learning view */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">
          Do you see onboarding as a one-time event or an ongoing journey?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ONBOARDING_VIEW.map(v => (
            <SelectCard
              key={v.id}
              icon={v.icon}
              label={v.label}
              desc={v.desc}
              selected={onboardingView === v.id}
              onClick={() => onChange('onboarding_view', v.id)}
            />
          ))}
        </div>
      </div>

      {onboardingView !== 'one_time' && (
        <TextAreaField
          label="What would keep a platform valuable after month 1?"
          value={postMonth1}
          onChange={v => onChange('post_month1', v)}
          placeholder="e.g. Keeps surfacing relevant architecture decisions, reminds about quarterly rotations, suggests senior mentors for specific topics..."
          rows={3}
        />
      )}

      {/* AI vs human slider */}
      <div className="p-5 rounded-xl bg-secondary/50 border border-border">
        <SliderField
          label="AI-powered vs human-led: where should the platform land?"
          value={aiVsHuman}
          onChange={v => onChange('ai_vs_human', v)}
          leftLabel="Fully AI-assisted"
          rightLabel="Mostly human-guided"
          description="1 = AI does everything, 10 = humans are primary, AI just helps"
        />
      </div>
    </ChapterShell>
  );
}
