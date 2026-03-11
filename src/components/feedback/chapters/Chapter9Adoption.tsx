import React from 'react';
import { ChapterShell, SelectCard, SliderField, TextAreaField } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';
import { cn } from '@/lib/utils';

const DECISION_MAKERS = [
  { id: 'cto', label: 'CTO', icon: '⚙️' },
  { id: 'vpe', label: 'VP Engineering', icon: '🏛️' },
  { id: 'em', label: 'Eng Manager', icon: '👥' },
  { id: 'head_hr', label: 'Head of People', icon: '🧑‍🤝‍🧑' },
  { id: 'devex', label: 'DevEx / Platform Lead', icon: '🛠️' },
  { id: 'finance', label: 'Finance approval', icon: '💰' },
  { id: 'committee', label: 'Procurement committee', icon: '📋' },
];

const KPI_OPTIONS = [
  { id: 'first_pr', label: 'Time to first PR', icon: '🔀' },
  { id: 'time_productive', label: 'Time to productive', icon: '⚡' },
  { id: 'retention_90d', label: '90-day retention', icon: '📌' },
  { id: 'nps', label: 'Onboarding NPS', icon: '⭐' },
  { id: 'mentor_time', label: 'Mentor time saved', icon: '⏱️' },
  { id: 'doc_freshness', label: 'Doc freshness score', icon: '🌿' },
  { id: 'ticket_volume', label: 'Onboarding ticket volume', icon: '🎫' },
  { id: 'time_oncall', label: 'Time to on-call ready', icon: '📟' },
];

const COMPLIANCE_OPTIONS = [
  { id: 'soc2', label: 'SOC 2 Type II', icon: '🛡️' },
  { id: 'gdpr', label: 'GDPR', icon: '🇪🇺' },
  { id: 'hipaa', label: 'HIPAA', icon: '🏥' },
  { id: 'iso27001', label: 'ISO 27001', icon: '📋' },
  { id: 'fedramp', label: 'FedRAMP', icon: '🏛️' },
  { id: 'ccpa', label: 'CCPA', icon: '🌴' },
  { id: 'none', label: 'No specific requirements', icon: '✓' },
];

const BUDGET_RANGES = [
  'Under $10K/year',
  '$10K–$50K/year',
  '$50K–$150K/year',
  '$150K–$500K/year',
  '$500K+/year',
  'Prefer not to say',
];

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
}

export function Chapter9Adoption({ answers, onChange }: Props) {
  const decisionMakers = (answers.decision_makers as string[]) || [];
  const successKpis = (answers.success_kpis as string[]) || [];
  const compliance = (answers.compliance as string[]) || [];
  const budgetRange = answers.budget_range as string | undefined;
  const multiTeam = answers.multi_team as string | undefined;
  const scaleText = (answers.scale_text as string) || '';

  const toggleDecisionMaker = (id: string) => {
    const next = decisionMakers.includes(id) ? decisionMakers.filter(x => x !== id) : [...decisionMakers, id];
    onChange('decision_makers', next);
  };

  const toggleKpi = (id: string) => {
    const next = successKpis.includes(id) ? successKpis.filter(x => x !== id) : [...successKpis, id];
    onChange('success_kpis', next);
  };

  const toggleCompliance = (id: string) => {
    const next = compliance.includes(id) ? compliance.filter(x => x !== id) : [...compliance, id];
    onChange('compliance', next);
  };

  return (
    <ChapterShell
      title="Adoption & business context"
      subtitle="Help us understand how decisions get made and what success looks like for your organization."
    >
      {/* Decision makers */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">
          Who would be involved in the buying decision? <span className="text-muted-foreground font-normal">(select all that apply)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DECISION_MAKERS.map(d => (
            <SelectCard
              key={d.id}
              icon={d.icon}
              label={d.label}
              size="sm"
              selected={decisionMakers.includes(d.id)}
              onClick={() => toggleDecisionMaker(d.id)}
            />
          ))}
        </div>
      </div>

      {/* Success KPIs */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">
          Which KPIs would you use to measure onboarding platform success?
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {KPI_OPTIONS.map(k => (
            <SelectCard
              key={k.id}
              icon={k.icon}
              label={k.label}
              size="sm"
              selected={successKpis.includes(k.id)}
              onClick={() => toggleKpi(k.id)}
            />
          ))}
        </div>
      </div>

      {/* Compliance */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">Compliance requirements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMPLIANCE_OPTIONS.map(c => (
            <SelectCard
              key={c.id}
              icon={c.icon}
              label={c.label}
              size="sm"
              selected={compliance.includes(c.id)}
              onClick={() => toggleCompliance(c.id)}
            />
          ))}
        </div>
      </div>

      {/* Budget range — optional */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">
          Annual budget range <span className="text-muted-foreground font-normal">(optional)</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {BUDGET_RANGES.map(b => (
            <button
              key={b}
              onClick={() => onChange('budget_range', budgetRange === b ? undefined : b)}
              className={cn(
                'px-4 py-2 rounded-full text-sm border transition-all',
                budgetRange === b
                  ? 'bg-primary/20 border-primary/50 text-primary font-medium'
                  : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Scalability */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">Scalability needs</h3>
        <div className="flex flex-wrap gap-2">
          {['Single team', 'Multi-team', 'Whole org', 'White-label / resell', 'Role-based packs'].map(s => (
            <button
              key={s}
              onClick={() => onChange('multi_team', multiTeam === s ? undefined : s)}
              className={cn(
                'px-4 py-2 rounded-full text-sm border transition-all',
                multiTeam === s
                  ? 'bg-primary/20 border-primary/50 text-primary font-medium'
                  : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <TextAreaField
          label="Any specific scale or architecture requirements?"
          value={scaleText}
          onChange={v => onChange('scale_text', v)}
          placeholder="e.g. Need to support 5 engineering teams across 3 geo locations with different tech stacks..."
          rows={3}
        />
      </div>
    </ChapterShell>
  );
}
