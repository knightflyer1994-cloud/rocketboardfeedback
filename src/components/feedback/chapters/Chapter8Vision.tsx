import React from 'react';
import { ChapterShell } from '../FeedbackWidgets';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    title: 'Zero-Hallucination AI',
    desc: 'Claim-level verification engine that forbids AI from inventing code.',
    icon: '🧠',
    color: 'bg-emerald-500/10 text-emerald-500',
    span: 'md:col-span-2',
    details: '4-Stage Pipeline: Structural Enforcement → Claims Audit → Server Hydration → Citation Mapping.'
  },
  {
    title: 'AST-Aware Search',
    desc: 'Hybrid retrieval using pgvector and tree-sitter tags.',
    icon: '🔍',
    color: 'bg-blue-500/10 text-blue-500',
    span: 'md:col-span-1',
  },
  {
    title: '13+ Connectors',
    desc: 'Ingest from GitHub, Confluence, Notion, Slack, Jira, and more.',
    icon: '📦',
    color: 'bg-indigo-500/10 text-indigo-500',
    span: 'md:col-span-1',
  },
  {
    title: 'Auto-Remediation',
    desc: 'AI detects repo changes and repairs stale content.',
    icon: '🔄',
    color: 'bg-orange-500/10 text-orange-500',
    span: 'md:col-span-1',
  },
  {
    title: '14 AI Task Types',
    desc: 'From Q&A to curated 1:1 question banks.',
    icon: '⚡',
    color: 'bg-pink-500/10 text-pink-500',
    span: 'md:col-span-1',
  },
];

const TARGET_AUDIENCE = [
  { label: 'Engineering Leads', desc: 'Stop being the onboarding bottleneck.', icon: '👑' },
  { label: 'Growing Teams', desc: 'Ship guides before day one.', icon: '📈' },
  { label: 'OSS Maintainers', desc: 'Help contributors understand fast.', icon: '🌐' },
];

export function Chapter8Vision() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <ChapterShell
      title="The RocketBoard Vision"
      subtitle="The Zero-Hallucination Engine for Engineering Teams."
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10 py-4"
      >
        {/* HERO CARD */}
        <motion.div 
          variants={item}
          className="relative group overflow-hidden rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/30 p-8 md:p-12"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen Onboarding
            </div>
            <h3 className="text-4xl md:text-5xl font-heading font-bold text-foreground leading-[1.1] mb-6">
              Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">codebase</span> into a self-teaching organism.
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RocketBoard ingests your repos, docs, and chats to generate evidence-grounded 
              learning paths that stay fresh as your code evolves.
            </p>
          </div>
        </motion.div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`p-8 rounded-[2rem] border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all flex flex-col justify-between group h-full shadow-sm hover:shadow-glow-primary/5 ${f.span}`}
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center text-3xl mb-8 shadow-sm`}>
                  {f.icon}
                </div>
                <h4 className="text-xl font-heading font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {f.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {f.desc}
                </p>
                {f.details && (
                  <div className="pt-4 mt-4 border-t border-border/50">
                    <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Technical Moat</p>
                    <p className="text-xs text-secondary-foreground italic">{f.details}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-end">
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <span className="text-primary text-xs">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TARGET AUDIENCE - Built for you */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TARGET_AUDIENCE.map((t, i) => (
            <motion.div
              key={t.label}
              variants={item}
              className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex items-center gap-4 group hover:bg-secondary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {t.icon}
              </div>
              <div>
                <h5 className="font-heading font-bold text-sm text-foreground">{t.label}</h5>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FOOTER CALLOUT */}
        <motion.div 
          variants={item}
          className="p-1 px-1 rounded-[2rem] bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30"
        >
          <div className="bg-card rounded-[1.9rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
            <div className="max-w-md">
              <h4 className="text-xl font-heading font-bold text-foreground mb-2">BYOK Security First</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your own API keys (OpenAI, Anthropic, Gemini) with zero-knowledge AES-256 encryption. Your data never leaves your infrastructure unless you want it to.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {['SOC2 Ready', 'AES-256', 'RLS Hardened'].map(tag => (
                <span key={tag} className="px-4 py-2 rounded-full bg-secondary border border-border text-[10px] font-bold uppercase tracking-widest text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ChapterShell>
  );
}
