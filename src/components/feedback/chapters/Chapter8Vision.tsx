import React from 'react';
import { ChapterShell } from '../FeedbackWidgets';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
  {
    title: 'Zero-Hallucination AI',
    desc: 'The only engine that forbids AI from inventing code via a strict verification moat.',
    icon: '🧠',
    color: 'bg-emerald-500/10 text-emerald-500',
    span: 'md:col-span-2',
    details: '4-Stage Pipeline: Structural Enforcement → Claims Audit → Server Hydration → Citation Mapping.'
  },
  {
    title: 'AST-Aware Search',
    desc: 'Hybrid retrieval using pgvector and tree-sitter tags for 100% accurate symbol matching.',
    icon: '🔍',
    color: 'bg-blue-500/10 text-blue-500',
    span: 'md:col-span-1',
  },
  {
    title: 'Self-Teaching Repo',
    desc: 'GitHub webhooks detect changes and AI drafts auto-remediation for stale guides.',
    icon: '🔄',
    color: 'bg-orange-500/10 text-orange-500',
    span: 'md:col-span-1',
  },
  {
    title: '13+ Connectors',
    desc: 'Universal ingestion: GitHub, Notion, Confluence, Slack, Jira, and more.',
    icon: '📦',
    color: 'bg-indigo-500/10 text-indigo-500',
    span: 'md:col-span-1',
  },
  {
    title: 'Evidence Grounding',
    desc: 'Every word is backed by a verifiable source span. Zero ungrounded claims.',
    icon: '🎯',
    color: 'bg-pink-500/10 text-pink-500',
    span: 'md:col-span-1',
  },
];

const AUDIENCE = [
  { label: 'Engineering Leads', desc: 'Unblock your team.', icon: '👑' },
  { label: 'New Hires', desc: 'Day 1 productivity.', icon: '🚀' },
  { label: 'Maintainers', desc: 'Understand everything.', icon: '📜' },
];

export function Chapter8Vision() {
  return (
    <ChapterShell
      title="The RocketBoard Vision"
      subtitle="The Zero-Hallucination Engine for High-Performance Engineering Teams."
    >
      <div className="relative space-y-12 py-6">
        {/* Background Glows */}
        <div className="absolute top-0 -left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group p-8 md:p-14 rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Live Codebase Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-white leading-tight">
              Turn your docs into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent">LIVING</span> organism.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              RocketBoard doesn't just "chat" with your code. It builds a verifiable, 
              self-updating technical brain that onboarding engineers can trust implicitly.
            </p>
          </div>
          
          {/* Abstract Grid Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </motion.div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group relative p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-primary/40 transition-all duration-500 overflow-hidden ${f.span}`}
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h4 className="text-2xl font-heading font-bold text-white mb-3">{f.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  {f.details && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">4-Stage pipeline</p>
                      <div className="flex flex-wrap gap-2">
                        {['Structure', 'Claims', 'Hydration', 'Citation'].map(step => (
                          <span key={step} className="px-2 py-1 rounded bg-white/5 text-[9px] text-slate-300 font-mono italic">
                            {step}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}

          {/* NEW: LEARNER PERSONALITY CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="md:col-span-2 group relative p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.03] backdrop-blur-xl transition-all"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
                  Personality Engine
                </div>
                <h4 className="text-3xl font-heading font-bold text-white">Adaptive Learning Profiles</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  RocketBoard detects your seniority and learning style. It swaps abstract descriptions for 
                  <span className="text-white"> code-centric exercises</span> for seniors, and <span className="text-white">visual analogies</span> for juniors.
                </p>
              </div>
              <div className="w-full md:w-64 p-4 rounded-2xl border border-white/10 bg-black/40 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-mono text-slate-300 uppercase">Tone: Socratic</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-accent" />
                </div>
                <p className="text-[11px] italic text-slate-500">"Instead of telling you the answer, let's explore why the AST tags this symbol..."</p>
              </div>
            </div>
          </motion.div>

          {/* NEW: INTERACTIVE CITATION MOCKUP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="group relative p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl transition-all"
          >
            <div className="space-y-6">
              <h4 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                <span className="text-primary text-2xl">⚡</span> Interactive Grounding
              </h4>
              <div className="p-4 rounded-xl border border-white/10 bg-black/60 space-y-3">
                <p className="text-[11px] text-slate-300">
                  ...use the <span className="text-primary font-bold decoration-dotted underline cursor-help">useQuery [S1]</span> hook to fetch RAG metrics...
                </p>
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ repeat: Infinity, duration: 3, repeatType: 'reverse' }}
                  className="p-2 bg-slate-900 rounded border border-white/10 shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-mono text-slate-500">api.ts • Line 142</span>
                    <span className="text-[8px] text-primary">100% Match</span>
                  </div>
                  <div className="h-8 bg-black/30 rounded" />
                </motion.div>
              </div>
              <p className="text-[11px] text-slate-400">Hover citation badges for live source validation.</p>
            </div>
          </motion.div>
        </div>

        {/* TRUST / AUDIENCE */}
        <div className="flex flex-wrap gap-4 justify-center">
          {AUDIENCE.map(a => (
            <div key={a.label} className="px-6 py-4 rounded-3xl border border-white/5 bg-white/5 flex items-center gap-3">
              <span className="text-xl">{a.icon}</span>
              <div>
                <p className="text-xs font-bold text-white leading-none">{a.label}</p>
                <p className="text-[10px] text-slate-500">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SECURITY FOOTER */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-r from-primary/20 via-white/5 to-accent/20 border border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h4 className="text-xl font-heading font-bold text-white ring-offset-slate-900 uppercase tracking-tight">Security-First BYOK</h4>
              <p className="text-sm text-slate-400">Bring your own keys. Your code stays encrypted and private. Always.</p>
            </div>
            <div className="flex gap-2">
              {['AES-256', 'SOC2 Ready', 'No-Persistence'].map(t => (
                <span key={t} className="px-4 py-2 rounded-full bg-black/40 border border-white/10 text-[9px] font-bold text-primary tracking-widest uppercase">{t}</span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </ChapterShell>
  );
}
