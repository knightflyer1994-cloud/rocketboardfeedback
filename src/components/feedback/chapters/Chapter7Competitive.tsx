import React from 'react';
import { ChapterShell, SelectCard, TextAreaField } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';

const TOOLS_TRIED = [
  { id: 'notion_custom', label: 'Custom Notion/Confluence', icon: '📋' },
  { id: 'lms', label: 'LMS (Docebo, Cornerstone)', icon: '🎓' },
  { id: 'rippling', label: 'Rippling Onboarding', icon: '🌊' },
  { id: 'workday_learn', label: 'Workday Learning', icon: '💼' },
  { id: 'internal_wiki', label: 'Internal Wiki only', icon: '🗂️' },
  { id: 'slack_channels', label: 'Slack channels + docs', icon: '💬' },
  { id: 'readmes', label: 'README-driven dev', icon: '📖' },
  { id: 'loom', label: 'Loom video onboarding', icon: '🎥' },
  { id: 'mentor_program', label: 'Structured mentor program', icon: '🤝' },
  { id: 'nothing', label: 'Nothing formal', icon: '🤷' },
];

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
}

export function Chapter7Competitive({ answers, onChange }: Props) {
  const toolsTried = (answers.tools_tried as string[]) || [];
  const whatWorked = (answers.what_worked as string) || '';
  const whatFailed = (answers.what_failed as string) || '';
  const reasonNotBought = (answers.reason_not_bought as string) || '';

  const toggleTool = (id: string) => {
    const next = toolsTried.includes(id)
      ? toolsTried.filter(x => x !== id)
      : [...toolsTried, id];
    onChange('tools_tried', next);
  };

  return (
    <ChapterShell
      title="Competitive landscape"
      subtitle="What have you already tried, and what's worked or failed? This helps us avoid reinventing the wrong wheel."
    >
      {/* Tools tried */}
      <div className="space-y-3">
        <h3 className="text-base font-heading font-semibold text-foreground">
          Which approaches have you tried for engineering onboarding? <span className="text-muted-foreground font-normal">(select all)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOOLS_TRIED.map(t => (
            <SelectCard
              key={t.id}
              icon={t.icon}
              label={t.label}
              size="sm"
              selected={toolsTried.includes(t.id)}
              onClick={() => toggleTool(t.id)}
            />
          ))}
        </div>
      </div>

      {toolsTried.length > 0 && toolsTried[0] !== 'nothing' && (
        <>
          <TextAreaField
            label="What worked well about those approaches?"
            value={whatWorked}
            onChange={v => onChange('what_worked', v)}
            placeholder="e.g. Notion pages were easy to create, Loom videos helped visual learners..."
            rows={3}
          />
          <TextAreaField
            label="What fundamentally failed or fell apart over time?"
            value={whatFailed}
            onChange={v => onChange('what_failed', v)}
            placeholder="e.g. Pages became outdated in 3 months, nobody maintained them, couldn't search across tools..."
            rows={3}
          />
        </>
      )}

      <TextAreaField
        label="Have you ever evaluated and then not bought a dedicated onboarding tool? What stopped you?"
        value={reasonNotBought}
        onChange={v => onChange('reason_not_bought', v)}
        placeholder="e.g. Too expensive, didn't integrate with GitHub, required too much setup, didn't trust AI accuracy..."
        rows={4}
        hint="Even negative signals are gold for us."
      />
    </ChapterShell>
  );
}
