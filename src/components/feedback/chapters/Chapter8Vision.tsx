import React from 'react';
import { ChapterShell } from '../FeedbackWidgets';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    title: 'Zero-Hallucination AI',
    desc: '4-stage pipeline with claim-level verification and server-side code hydration.',
    icon: '🧠',
    color: 'bg-emerald-500/10 text-emerald-500',
    span: 'col-span-2',
  },
  {
    title: 'AST-Aware Search',
    desc: 'Hybrid retrieval using pgvector, full-text, and tree-sitter tags.',
    icon: '🔍',
    color: 'bg-blue-500/10 text-blue-500',
    span: 'col-span-1',
  },
  {
    title: 'Grounded Citations',
    desc: 'Interactive badges with hover previews and source file explorer.',
    icon: '🎯',
    color: 'bg-purple-500/10 text-purple-500',
    span: 'col-span-1',
  },
  {
    title: 'Auto-Remediation',
    desc: 'AI detects repo changes via webhooks and repairs stale content automatically.',
    icon: '🔄',
    color: 'bg-orange-500/10 text-orange-500',
    span: 'col-span-1',
  },
  {
    title: '14 AI Task Types',
    desc: 'From module planners to "Ask Your Lead" curated 1:1 question banks.',
    icon: '⚡',
    color: 'bg-pink-500/10 text-pink-500',
    span: 'col-span-1',
  },
  {
    title: 'BYOK Security',
    desc: 'Bring your own API keys with AES-256 pgcrypto encryption.',
    icon: '🔒',
    color: 'bg-indigo-500/10 text-indigo-500',
    span: 'col-span-1 border-indigo-500/20',
  },
];

export function Chapter8Vision() {
  return (
    <ChapterShell
      title="The RocketBoard Vision"
      subtitle="AI-native developer onboarding that is actually grounded in your code."
    >
      <div className="space-y-8">
        {/* Hero Concept */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary border border-primary/20 flex flex-col justify-center">
            <h3 className="text-3xl font-heading font-bold text-foreground mb-4">
              Codebase-Native Intelligence
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RocketBoard ingests your GitHub repos, Confluence, and Notion pages to generate 
              structured learning modules and interactive glossaries that stay fresh automatically.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-secondary border border-border flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl mb-4 block">📦</span>
              <span className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-widest">
                13+ Connectors
              </span>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-3xl border border-border bg-card hover:border-primary/30 transition-all flex flex-col justify-between group ${f.span}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center text-xl`}>
                  {f.icon}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-primary">✨</span>
                </div>
              </div>
              <div>
                <h4 className="font-heading font-semibold text-foreground mb-1">{f.title}</h4>
                <p className="text-xs text-muted-foreground leading-snug">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Deployment Section */}
        <div className="p-6 rounded-3xl bg-primary/5 border border-dashed border-primary/30 flex items-center justify-between gap-6">
          <div className="flex-1">
            <h4 className="text-sm font-heading font-bold text-primary uppercase tracking-wider mb-2">Multi-Tenant Engineering</h4>
            <p className="text-sm text-muted-foreground italic">"Deploy to your infrastructure with BYOK or use our managed cloud with full RLS security."</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {['GitHub', 'Notion', 'Slack'].map(l => (
              <span key={l} className="px-3 py-1 rounded-full bg-secondary border border-border text-[10px] font-medium">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </ChapterShell>
  );
}
