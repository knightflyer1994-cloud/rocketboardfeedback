import React from 'react';
import { cn } from '@/lib/utils';
import type { FlowMode } from '@/types/feedback';
import { CHAPTERS_FAST, CHAPTERS_DEEP, CHAPTERS_EXECUTIVE } from '@/types/feedback';

interface ProgressBarProps {
  mode: FlowMode;
  currentChapter: number;
}

export function ProgressBar({ mode, currentChapter }: ProgressBarProps) {
  const chapters = mode === 'deep' ? CHAPTERS_DEEP : mode === 'fast' ? CHAPTERS_FAST : CHAPTERS_EXECUTIVE;
  const currentIdx = chapters.findIndex(c => c.id === currentChapter);
  const progress = currentIdx >= 0 ? ((currentIdx + 1) / chapters.length) * 100 : 0;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
              Engineering Onboarding Insights
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {currentIdx + 1} / {chapters.length} chapters
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
          <div
            className="h-full gradient-progress rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Chapter pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {chapters.map((chapter, idx) => {
            const isActive = chapter.id === currentChapter;
            const isDone = idx < currentIdx;
            return (
              <div
                key={chapter.id}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-300',
                  isActive && 'bg-primary/20 text-primary border border-primary/30 font-medium',
                  isDone && 'bg-secondary text-muted-foreground',
                  !isActive && !isDone && 'text-muted-foreground/50'
                )}
              >
                {isDone ? (
                  <span className="text-score-low">✓</span>
                ) : (
                  <span className={cn(
                    'w-4 h-4 rounded-full text-xs flex items-center justify-center font-heading',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}>
                    {idx + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{chapter.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
