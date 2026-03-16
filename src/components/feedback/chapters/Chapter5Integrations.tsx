import React, { useState } from 'react';
import { ChapterShell, SelectCard, SliderField, TextAreaField, RankedCard } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';
import { INTEGRATION_OPTIONS } from '@/types/feedback';

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
}

export function Chapter5Integrations({ answers, onChange }: Props) {
  const [draggedFrom, setDraggedFrom] = useState<number | null>(null);

  const selectedIntegrations = (answers.selected_integrations as string[]) || [];
  const rankedIntegrations = (answers.ranked_integrations as string[]) || [];
  const ingestionImportance = (answers.ingestion_importance as number) || 7;
  const redlineSources = (answers.redline_sources as string) || '';
  const aiGovernance = (answers.ai_governance as string) || '';

  const toggleIntegration = (id: string) => {
    const next = selectedIntegrations.includes(id)
      ? selectedIntegrations.filter(x => x !== id)
      : [...selectedIntegrations, id];
    onChange('selected_integrations', next);
    if (selectedIntegrations.includes(id)) {
      onChange('ranked_integrations', rankedIntegrations.filter(x => x !== id));
    }
  };

  const addToRanked = (id: string) => {
    if (rankedIntegrations.length >= 5) return;
    if (!rankedIntegrations.includes(id)) {
      onChange('ranked_integrations', [...rankedIntegrations, id]);
    }
  };

  const removeFromRanked = (id: string) => {
    onChange('ranked_integrations', rankedIntegrations.filter(x => x !== id));
  };

  const handleDragStart = (idx: number) => setDraggedFrom(idx);
  const handleDrop = (toIdx: number) => {
    if (draggedFrom === null || draggedFrom === toIdx) return;
    const newRanked = [...rankedIntegrations];
    const [moved] = newRanked.splice(draggedFrom, 1);
    newRanked.splice(toIdx, 0, moved);
    onChange('ranked_integrations', newRanked);
    setDraggedFrom(null);
  };

  const categories = [...new Set(INTEGRATION_OPTIONS.map(i => i.category))];

  return (
    <ChapterShell
      title="Integrations & security constraints"
      subtitle="What systems must a platform connect to, and what are your non-negotiables?"
    >
      {/* Integration logo picker by category */}
      <div className="space-y-5">
        {categories.map(cat => (
          <div key={cat} className="space-y-2">
            <h4 className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h4>
            <div className="flex flex-wrap gap-2">
              {INTEGRATION_OPTIONS.filter(i => i.category === cat).map(integration => (
                <div key={integration.id} className="group relative">
                  <button
                    onClick={() => toggleIntegration(integration.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all duration-200 ${
                      selectedIntegrations.includes(integration.id)
                        ? 'border-primary/50 bg-primary/10 text-primary font-medium shadow-glow-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span className="text-base">{integration.icon}</span>
                    <span>{integration.label}</span>
                    {selectedIntegrations.includes(integration.id) && (
                      <span className="text-primary text-xs">✓</span>
                    )}
                  </button>
                  {selectedIntegrations.includes(integration.id) && !rankedIntegrations.includes(integration.id) && rankedIntegrations.length < 5 && (
                    <button
                      onClick={() => addToRanked(integration.id)}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                    >
                      Rank
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Other systems */}
      <div className="space-y-4 p-5 rounded-xl bg-secondary/50 border border-border">
        <TextAreaField
          label="Are you using any other systems not listed above? (e.g. custom internal tools)"
          value={(answers.other_integrations as string) || ''}
          onChange={v => onChange('other_integrations', v)}
          placeholder="e.g. Custom internal tool, Bitbucket, Datadog..."
          rows={2}
          hint="List any other critical platforms we missed."
        />
      </div>

      {/* Top 5 ranked */}
      {selectedIntegrations.length > 0 && (
        <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-heading font-semibold text-foreground">Your top 5 must-have integrations</h4>
            <span className="text-xs text-muted-foreground">{rankedIntegrations.length}/5</span>
          </div>
          {rankedIntegrations.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Hover a selected integration and click "Rank" to prioritize</p>
          )}
          {rankedIntegrations.map((id, idx) => {
            const integration = INTEGRATION_OPTIONS.find(i => i.id === id);
            if (!integration) return null;
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
                  icon={integration.icon}
                  label={`${integration.label} (${integration.category})`}
                  onRemove={() => removeFromRanked(id)}
                />
              </div>
            );
          })}

          {selectedIntegrations.filter(id => !rankedIntegrations.includes(id)).length > 0 && rankedIntegrations.length < 5 && (
            <div className="pt-2 border-t border-border flex flex-wrap gap-2">
              {selectedIntegrations.filter(id => !rankedIntegrations.includes(id)).map(id => {
                const integration = INTEGRATION_OPTIONS.find(i => i.id === id);
                if (!integration) return null;
                return (
                  <button
                    key={id}
                    onClick={() => addToRanked(id)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all"
                  >
                    {integration.icon} {integration.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Secure ingestion importance */}
      <div className="space-y-4 p-5 rounded-xl bg-secondary/50 border border-border">
        <SliderField
          label="How important is automated, secure ingestion of internal knowledge?"
          value={ingestionImportance}
          onChange={v => onChange('ingestion_importance', v)}
          leftLabel="Nice to have"
          rightLabel="Non-negotiable"
          description="Automatic sync vs manual copy-paste of knowledge"
        />

        <TextAreaField
          label="Any 'red-line' data sources that can NEVER be ingested by AI?"
          value={redlineSources}
          onChange={v => onChange('redline_sources', v)}
          placeholder="e.g. HR files, performance reviews, customer PII, proprietary IP docs..."
          rows={3}
        />

        <TextAreaField
          label="AI governance signals — what governance requirements would make this a non-starter?"
          value={aiGovernance}
          onChange={v => onChange('ai_governance', v)}
          placeholder="e.g. Must keep data on-prem, need audit trails, only private LLM inference..."
          rows={3}
        />
      </div>
    </ChapterShell>
  );
}
