import React from 'react';
import { ChapterShell, TextAreaField } from '../FeedbackWidgets';
import type { ChapterAnswers } from '@/types/feedback';

interface Props {
  answers: ChapterAnswers;
  onChange: (key: string, value: unknown) => void;
  onComplete: () => void;
  saving?: boolean;
}

export function Chapter10Closing({ answers, onChange, onComplete, saving }: Props) {
  const anythingElse = (answers.anything_else as string) || '';
  const followUpConsent = answers.follow_up_consent as boolean | undefined;
  
  // Use local state for PII to prevent it from being written to the answers table via global onChange
  const [contactName, setContactName] = React.useState((answers.contact_name as string) || '');
  const [contactEmail, setContactEmail] = React.useState((answers.contact_email as string) || '');

  const handleComplete = () => {
    // We pass the local PII state back only at the final step
    (onComplete as any)({
      name: contactName,
      email: contactEmail
    });
  };

  return (
    <ChapterShell
      title="Almost done — last thoughts"
      subtitle="Thank you for investing your time. This is the most valuable research we can do."
    >
      <TextAreaField
        label="Anything else you'd like us to know?"
        value={anythingElse}
        onChange={v => onChange('anything_else', v)}
        placeholder="e.g. A specific pain point we haven't asked about, something you're excited or worried about, a piece of advice for us..."
        rows={5}
        hint="This is the free-form space — anything goes."
      />

      {/* Follow-up consent */}
      <div className="space-y-4 p-5 rounded-xl border border-border bg-secondary/30">
        <div>
          <h3 className="text-base font-heading font-semibold text-foreground">Follow-up interest</h3>
          <p className="text-sm text-muted-foreground mt-1">
            We'd love to share early access, a prototype demo, or the aggregated insights report with you.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onChange('follow_up_consent', true)}
            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              followUpConsent === true
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            👋 Yes, I'd like to stay in touch
          </button>
          <button
            onClick={() => onChange('follow_up_consent', false)}
            className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              followUpConsent === false
                ? 'bg-secondary border-primary/30 text-foreground'
                : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            No thanks, keep it anonymous
          </button>
        </div>

        {followUpConsent === true && (
          <div className="space-y-3 pt-2 animate-slide-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Your name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Work email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pt-4">
        <button
          onClick={handleComplete}
          disabled={saving}
          className="w-full py-4 rounded-xl gradient-button text-primary-foreground font-heading font-bold text-lg shadow-glow-primary hover:shadow-glow-accent transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed animate-pulse-glow"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating your Insight Report...
            </span>
          ) : (
            '✨ Generate My Onboarding Insight Report'
          )}
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Your responses are confidential and will only be used in aggregate to inform product direction.
        </p>
      </div>
    </ChapterShell>
  );
}
