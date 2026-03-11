import React from 'react';
import { ChapterShell, SelectCard, TextAreaField } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';
import { KNOWLEDGE_SOURCES } from '@/types/feedback';
import { cn } from '@/lib/utils';

const FRESHNESS_OPTIONS = [
  { id: 'fresh', label: 'Fresh', icon: '🟢', desc: 'Usually up to date' },
  { id: 'mixed', label: 'Mixed', icon: '🟡', desc: 'Some current, some stale' },
  { id: 'stale', label: 'Stale', icon: '🔴', desc: 'Often outdated' },
];

const ROT_FREQUENCIES = [
  'Within weeks',
  'Within months',
  '6–12 months',
  '1–2 years',
  'No clear pattern',
];

const ROT_CAUSES = [
  { id: 'no_owner', label: 'No clear doc owner', icon: '👻' },
  { id: 'no_process', label: 'No review process', icon: '📋' },
  { id: 'fast_growth', label: 'Too fast growth', icon: '🚀' },
  { id: 'tool_changes', label: 'Tool/system changes', icon: '🔄' },
  { id: 'team_turnover', label: 'Team turnover', icon: '🚪' },
  { id: 'no_incentive', label: 'No incentive to update', icon: '😴' },
];

const ACCESS_BLOCKERS = [
  { id: 'approval_chain', label: 'Long approval chains', icon: '🔗' },
  { id: 'security_review', label: 'Security reviews', icon: '🛡️' },
  { id: 'no_owner', label: 'No resource owner', icon: '❓' },
  { id: 'manual_process', label: 'Manual ticketing', icon: '🎫' },
  { id: 'compliance', label: 'Compliance requirements', icon: '📜' },
  { id: 'scattered_systems', label: 'Systems scattered across tools', icon: '🗂️' },
];

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
}

export function Chapter4Knowledge({ answers, onChange }: Props) {
  const selectedSources = (answers.knowledge_sources as string[]) || [];
  const sourceFreshness = (answers.source_freshness as Record<string, string>) || {};
  const rotFrequency = answers.rot_frequency as string | undefined;
  const rotCauses = (answers.rot_causes as string[]) || [];
  const accessBlockers = (answers.access_blockers as string[]) || [];
  const accessText = (answers.access_text as string) || '';

  const toggleSource = (id: string) => {
    const next = selectedSources.includes(id)
      ? selectedSources.filter(x => x !== id)
      : [...selectedSources, id];
    onChange('knowledge_sources', next);
  };

  const setFreshness = (sourceId: string, freshness: string) => {
    onChange('source_freshness', { ...sourceFreshness, [sourceId]: freshness });
  };

  const toggleCause = (id: string) => {
    const next = rotCauses.includes(id) ? rotCauses.filter(x => x !== id) : [...rotCauses, id];
    onChange('rot_causes', next);
  };

  const toggleBlocker = (id: string) => {
    const next = accessBlockers.includes(id) ? accessBlockers.filter(x => x !== id) : [...accessBlockers, id];
    onChange('access_blockers', next);
  };

  return (
    <ChapterShell
      title="Where does knowledge live?"
      subtitle="Map your company's knowledge landscape — we'll help you see the concentration and freshness risks."
    >
      {/* Knowledge tiles */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-heading font-semibold text-foreground">Which tools hold your engineering knowledge?</h3>
          <p className="text-sm text-muted-foreground mt-1">Select all that apply — we'll ask about freshness per source.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {KNOWLEDGE_SOURCES.map(src => (
            <SelectCard
              key={src.id}
              icon={src.icon}
              label={src.label}
              size="sm"
              selected={selectedSources.includes(src.id)}
              onClick={() => toggleSource(src.id)}
            />
          ))}
        </div>

        {/* Freshness follow-up per selected source */}
        {selectedSources.length > 0 && (
          <div className="space-y-3 p-4 rounded-xl border border-border bg-secondary/30">
            <h4 className="text-sm font-heading font-semibold text-foreground">How fresh is the content in each source?</h4>
            <div className="space-y-2">
              {selectedSources.map(id => {
                const src = KNOWLEDGE_SOURCES.find(s => s.id === id);
                if (!src) return null;
                const current = sourceFreshness[id];
                return (
                  <div key={id} className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <span>{src.icon}</span>
                      <span className="text-sm text-foreground">{src.label}</span>
                    </div>
                    <div className="flex gap-2">
                      {FRESHNESS_OPTIONS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setFreshness(id, f.id)}
                          className={cn(
                            'flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-all',
                            current === f.id
                              ? 'border-primary/50 bg-primary/10 text-primary font-medium'
                              : 'border-border bg-secondary text-muted-foreground hover:border-primary/30'
                          )}
                        >
                          {f.icon} {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Knowledge rot */}
      <div className="space-y-4">
        <h3 className="text-base font-heading font-semibold text-foreground">How quickly does documentation rot in your org?</h3>
        <div className="flex flex-wrap gap-2">
          {ROT_FREQUENCIES.map(f => (
            <button
              key={f}
              onClick={() => onChange('rot_frequency', f)}
              className={cn(
                'px-4 py-2 rounded-full text-sm border transition-all',
                rotFrequency === f
                  ? 'bg-primary/20 border-primary/50 text-primary font-medium'
                  : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Root causes of knowledge rot <span className="text-muted-foreground font-normal">(pick all that apply)</span></p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ROT_CAUSES.map(c => (
              <SelectCard
                key={c.id}
                icon={c.icon}
                label={c.label}
                size="sm"
                selected={rotCauses.includes(c.id)}
                onClick={() => toggleCause(c.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Access blockers */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">What are the biggest access blockers for new hires?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACCESS_BLOCKERS.map(b => (
            <SelectCard
              key={b.id}
              icon={b.icon}
              label={b.label}
              size="sm"
              selected={accessBlockers.includes(b.id)}
              onClick={() => toggleBlocker(b.id)}
            />
          ))}
        </div>
        <TextAreaField
          label="Any specific access story to share?"
          value={accessText}
          onChange={v => onChange('access_text', v)}
          placeholder="e.g. We waited 3 weeks for production read access because..."
          rows={3}
        />
      </div>
    </ChapterShell>
  );
}
