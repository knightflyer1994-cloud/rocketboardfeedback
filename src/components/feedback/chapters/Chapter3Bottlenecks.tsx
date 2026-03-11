import React, { useState } from 'react';
import { ChapterShell, SelectCard, SliderField, TextAreaField, RankedCard } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';
import { BOTTLENECK_CARDS } from '@/types/feedback';
import { cn } from '@/lib/utils';

const IMPACT_SLIDERS = [
  { key: 'frustration', label: 'Frustration level', left: 'Minor annoyance', right: 'Deal-breaker' },
  { key: 'time_to_productivity', label: 'Impact on time-to-productivity', left: 'Minimal', right: 'Months of delay' },
  { key: 'mentor_bandwidth', label: 'Mentor / senior bandwidth drain', left: 'Barely noticeable', right: 'Crushing' },
  { key: 'attrition_risk', label: 'Attrition risk contribution', left: 'No impact', right: 'People quit over it' },
  { key: 'knowledge_loss', label: 'Institutional knowledge loss risk', left: 'Low', right: 'Critical' },
];

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
}

export function Chapter3Bottlenecks({ answers, onChange }: Props) {
  const openText = (answers.open_example as string) || '';
  const impacts = (answers.impacts as Record<string, number>) || {
    frustration: 5, time_to_productivity: 5, mentor_bandwidth: 5, attrition_risk: 5, knowledge_loss: 5,
  };
  const selectedBottlenecks = (answers.selected_bottlenecks as string[]) || [];
  const rankedBottlenecks = (answers.ranked_bottlenecks as string[]) || [];
  const safetyScore = (answers.safety_score as number) || 5;
  const safetyText = (answers.safety_text as string) || '';

  const [draggedFrom, setDraggedFrom] = useState<number | null>(null);

  const toggleBottleneck = (id: string) => {
    const next = selectedBottlenecks.includes(id)
      ? selectedBottlenecks.filter(x => x !== id)
      : [...selectedBottlenecks, id];
    onChange('selected_bottlenecks', next);
    // Remove from ranked if deselected
    if (selectedBottlenecks.includes(id)) {
      onChange('ranked_bottlenecks', rankedBottlenecks.filter(x => x !== id));
    }
  };

  const addToRanked = (id: string) => {
    if (rankedBottlenecks.length >= 3) return;
    if (!rankedBottlenecks.includes(id)) {
      onChange('ranked_bottlenecks', [...rankedBottlenecks, id]);
    }
  };

  const removeFromRanked = (id: string) => {
    onChange('ranked_bottlenecks', rankedBottlenecks.filter(x => x !== id));
  };

  const handleDragStart = (idx: number) => setDraggedFrom(idx);
  const handleDrop = (toIdx: number) => {
    if (draggedFrom === null || draggedFrom === toIdx) return;
    const newRanked = [...rankedBottlenecks];
    const [moved] = newRanked.splice(draggedFrom, 1);
    newRanked.splice(toIdx, 0, moved);
    onChange('ranked_bottlenecks', newRanked);
    setDraggedFrom(null);
  };

  const updateImpact = (key: string, val: number) => {
    onChange('impacts', { ...impacts, [key]: val });
  };

  return (
    <ChapterShell
      title="Bottlenecks & impact"
      subtitle="What's actually slowing down your new hires? Be specific — this is the heart of our research."
    >
      {/* Open example */}
      <TextAreaField
        label="Describe a recent onboarding struggle you witnessed or experienced"
        value={openText}
        onChange={v => onChange('open_example', v)}
        placeholder="e.g. A senior engineer joined in January and it took 6 weeks to get production access because..."
        rows={4}
        hint="The more specific, the better — names aren't needed."
      />

      {/* Impact sliders */}
      <div className="space-y-4 p-5 rounded-xl bg-secondary/50 border border-border">
        <h3 className="text-base font-heading font-semibold text-foreground">Rate the overall impact of onboarding friction in your org</h3>
        <div className="space-y-5">
          {IMPACT_SLIDERS.map(s => (
            <SliderField
              key={s.key}
              label={s.label}
              value={impacts[s.key] || 5}
              onChange={v => updateImpact(s.key, v)}
              leftLabel={s.left}
              rightLabel={s.right}
              colorByValue
            />
          ))}
        </div>
      </div>

      {/* Bottleneck card sort */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-heading font-semibold text-foreground">Card sort: which bottlenecks resonate most?</h3>
          <p className="text-sm text-muted-foreground mt-1">Select all that apply, then force-rank your top 3 below.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BOTTLENECK_CARDS.map(card => (
            <div key={card.id} className="group relative">
              <SelectCard
                icon={card.icon}
                label={card.label}
                desc={card.desc}
                size="sm"
                selected={selectedBottlenecks.includes(card.id)}
                onClick={() => toggleBottleneck(card.id)}
              />
              {selectedBottlenecks.includes(card.id) && !rankedBottlenecks.includes(card.id) && rankedBottlenecks.length < 3 && (
                <button
                  onClick={() => addToRanked(card.id)}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                >
                  Add to top 3
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Ranked top 3 */}
        {selectedBottlenecks.length > 0 && (
          <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-heading font-semibold text-foreground">
                Your top 3 bottlenecks (drag to reorder)
              </h4>
              <span className="text-xs text-muted-foreground">{rankedBottlenecks.length}/3 selected</span>
            </div>
            {rankedBottlenecks.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Hover a selected card and click "Add to top 3"</p>
            )}
            {rankedBottlenecks.map((id, idx) => {
              const card = BOTTLENECK_CARDS.find(c => c.id === id);
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

            {/* Unranked selected options */}
            {selectedBottlenecks.filter(id => !rankedBottlenecks.includes(id)).length > 0 && rankedBottlenecks.length < 3 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Also selected (click to rank):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBottlenecks
                    .filter(id => !rankedBottlenecks.includes(id))
                    .map(id => {
                      const card = BOTTLENECK_CARDS.find(c => c.id === id);
                      if (!card) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => addToRanked(id)}
                          disabled={rankedBottlenecks.length >= 3}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all disabled:opacity-50"
                        >
                          <span>{card.icon}</span>
                          <span>{card.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emotional probe */}
      <div className="space-y-4 p-5 rounded-xl bg-secondary/50 border border-border">
        <SliderField
          label="How safe do new hires feel asking 'basic' questions in your org?"
          value={safetyScore}
          onChange={v => onChange('safety_score', v)}
          leftLabel="Not safe at all"
          rightLabel="Extremely safe"
          description="Psychological safety around knowledge gaps directly affects ramp time."
        />
        {safetyScore <= 6 && (
          <TextAreaField
            label="What creates that hesitation?"
            value={safetyText}
            onChange={v => onChange('safety_text', v)}
            placeholder="e.g. Senior engineers seem impatient, culture of 'figure it out'..."
            rows={3}
          />
        )}
      </div>
    </ChapterShell>
  );
}
