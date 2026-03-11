import React from 'react';
import { cn } from '@/lib/utils';

interface SelectCardProps {
  icon?: string;
  label: string;
  desc?: string;
  selected?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  badge?: string;
}

export function SelectCard({ icon, label, desc, selected, onClick, size = 'md', badge }: SelectCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative text-left rounded-xl border transition-all duration-200 cursor-pointer group',
        'hover:border-primary/50 hover:shadow-glow-primary',
        size === 'sm' && 'p-3',
        size === 'md' && 'p-4',
        size === 'lg' && 'p-5',
        selected
          ? 'border-primary/60 bg-primary/10 shadow-glow-primary'
          : 'border-border bg-card hover:bg-secondary/50',
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">✓</span>
        </div>
      )}
      {badge && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/30">
          {badge}
        </div>
      )}
      <div className="flex items-start gap-3">
        {icon && (
          <span className={cn(
            'flex-shrink-0 rounded-lg flex items-center justify-center text-lg transition-transform group-hover:scale-110',
            size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
            selected ? 'bg-primary/20' : 'bg-secondary'
          )}>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className={cn(
            'font-heading font-semibold leading-tight',
            size === 'sm' ? 'text-sm' : 'text-base',
            selected ? 'text-primary' : 'text-foreground'
          )}>
            {label}
          </p>
          {desc && (
            <p className={cn(
              'mt-1 text-muted-foreground leading-snug',
              size === 'sm' ? 'text-xs' : 'text-sm'
            )}>
              {desc}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

interface RankedCardProps {
  rank: number;
  icon?: string;
  label: string;
  onRemove: () => void;
}

export function RankedCard({ rank, icon, label, onRemove }: RankedCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/8">
      <div className="w-7 h-7 rounded-full gradient-button flex items-center justify-center text-primary-foreground text-sm font-bold font-heading flex-shrink-0">
        {rank}
      </div>
      <span className="text-lg flex-shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors text-xs px-2 py-1 rounded hover:bg-secondary"
      >
        ✕
      </button>
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  description?: string;
  colorByValue?: boolean;
}

export function SliderField({
  label,
  value,
  min = 1,
  max = 10,
  onChange,
  leftLabel,
  rightLabel,
  description,
  colorByValue,
}: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = colorByValue
    ? value <= 4 ? 'hsl(var(--score-low))' : value <= 7 ? 'hsl(var(--score-mid))' : 'hsl(var(--score-high))'
    : 'hsl(var(--primary))';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground font-heading">{label}</label>
        <span
          className="text-xl font-bold font-heading transition-all duration-200"
          style={{ color }}
        >
          {value}
          <span className="text-xs text-muted-foreground font-normal">/{max}</span>
        </span>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-l-full transition-all duration-200"
          style={{ width: `${pct}%`, background: color }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="relative z-10"
        />
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 4, hint }: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground font-heading">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 text-sm"
      />
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}

export function NumberInput({ label, value, onChange, placeholder, hint }: NumberInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground font-heading">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 text-sm"
      />
    </div>
  );
}

export function ChapterShell({ children, title, subtitle }: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="animate-slide-in-up space-y-8">
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
