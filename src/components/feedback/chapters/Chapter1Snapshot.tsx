import React from 'react';
import { ChapterShell, SelectCard, NumberInput, SliderField } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';

const ROLES = [
  { id: 'vpe', label: 'VP Engineering', icon: '🏛️' },
  { id: 'cto', label: 'CTO', icon: '⚙️' },
  { id: 'em', label: 'Eng Manager', icon: '👥' },
  { id: 'staff', label: 'Staff Engineer', icon: '🔭' },
  { id: 'senior', label: 'Senior Engineer', icon: '💻' },
  { id: 'director', label: 'Director of Eng', icon: '🎯' },
  { id: 'devex', label: 'DevEx / Platform', icon: '🛠️' },
  { id: 'principal', label: 'Principal Engineer', icon: '🧬' },
];

const HIRING_VOLUMES = [
  '1–5 engineers/year',
  '6–20 engineers/year',
  '21–50 engineers/year',
  '51–100 engineers/year',
  '100+ engineers/year',
];

const WORK_MODES = [
  { id: 'remote', label: 'Fully Remote', icon: '🌐' },
  { id: 'hybrid', label: 'Hybrid', icon: '🏢' },
  { id: 'office', label: 'In-Office', icon: '🏬' },
  { id: 'distributed', label: 'Globally Distributed', icon: '🗺️' },
];

const PERSONA_FOCUS = [
  { id: 'junior', label: 'Junior / New Grad', icon: '🌱' },
  { id: 'mid_backend', label: 'Mid-level Backend', icon: '⚙️' },
  { id: 'senior_staff', label: 'Senior / Staff', icon: '🔭' },
  { id: 'data_ml', label: 'Data / ML Engineers', icon: '🧠' },
  { id: 'frontend', label: 'Frontend Engineers', icon: '🎨' },
  { id: 'platform', label: 'Platform / Infra', icon: '☁️' },
  { id: 'all', label: 'All Roles Equally', icon: '🌟' },
];

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
  mode: 'fast' | 'deep';
}

export function Chapter1Snapshot({ answers, onChange, mode }: Props) {
  const role = answers.role as string | undefined;
  const workMode = answers.work_mode as string | undefined;
  const hiringVolume = answers.hiring_volume as string | undefined;
  const personaFocus = answers.persona_focus as string | undefined;

  return (
    <ChapterShell
      title="Let's start with a quick snapshot"
      subtitle="Tell us about your role and company to personalize your experience."
    >
      {/* Role */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">What's your current role?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ROLES.map(r => (
            <SelectCard
              key={r.id}
              icon={r.icon}
              label={r.label}
              size="sm"
              selected={role === r.id}
              onClick={() => onChange('role', r.id)}
            />
          ))}
        </div>
      </div>

      {/* Company sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberInput
          label="Total company headcount"
          value={(answers.company_size_total as string) || ''}
          onChange={v => onChange('company_size_total', v)}
          placeholder="e.g. 250"
          hint="Approximate total employees"
        />
        <NumberInput
          label="Engineering team size"
          value={(answers.company_size_eng as string) || ''}
          onChange={v => onChange('company_size_eng', v)}
          placeholder="e.g. 45"
          hint="Engineers, including data / platform"
        />
      </div>

      {/* Hiring volume */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">Engineering hiring volume</h3>
        <div className="flex flex-wrap gap-2">
          {HIRING_VOLUMES.map(v => (
            <button
              key={v}
              onClick={() => onChange('hiring_volume', v)}
              className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                hiringVolume === v
                  ? 'bg-primary/20 border-primary/50 text-primary font-medium'
                  : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Work mode */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">Primary work model</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WORK_MODES.map(w => (
            <SelectCard
              key={w.id}
              icon={w.icon}
              label={w.label}
              size="sm"
              selected={workMode === w.id}
              onClick={() => onChange('work_mode', w.id)}
            />
          ))}
        </div>
      </div>

      {/* Persona focus — Deep Dive only */}
      {mode === 'deep' && (
        <div className="space-y-3">
          <h3 className="text-base font-heading font-semibold text-foreground">
            Which persona do you care most about onboarding well?
          </h3>
          <p className="text-xs text-muted-foreground">This will shape some later questions to your context.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PERSONA_FOCUS.map(p => (
              <SelectCard
                key={p.id}
                icon={p.icon}
                label={p.label}
                size="sm"
                selected={personaFocus === p.id}
                onClick={() => onChange('persona_focus', p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </ChapterShell>
  );
}
