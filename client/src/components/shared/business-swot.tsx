import * as React from 'react';
import { TrendingUp, AlertTriangle, Lightbulb, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shape of the `swot` JSON block on a Business. All fields optional/nullable. */
export interface Swot {
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  opportunities?: string[] | null;
  threats?: string[] | null;
}

interface Quadrant {
  key: keyof Swot;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  wrap: string;
  chip: string;
  dot: string;
}

const QUADRANTS: Quadrant[] = [
  {
    key: 'strengths',
    label: 'Strengths',
    icon: TrendingUp,
    wrap: 'border-emerald-500/20 bg-emerald-500/5',
    chip: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  {
    key: 'weaknesses',
    label: 'Weaknesses',
    icon: AlertTriangle,
    wrap: 'border-amber-500/20 bg-amber-500/5',
    chip: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  {
    key: 'opportunities',
    label: 'Opportunities',
    icon: Lightbulb,
    wrap: 'border-sky-500/20 bg-sky-500/5',
    chip: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  {
    key: 'threats',
    label: 'Threats',
    icon: ShieldAlert,
    wrap: 'border-rose-500/20 bg-rose-500/5',
    chip: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
];

/** Renders a SWOT JSON block as four colored quadrants. Guards missing data. */
export function BusinessSwot({ swot }: { swot?: Swot | null }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {QUADRANTS.map((q) => {
        const items = (swot?.[q.key] ?? []).filter(Boolean) as string[];
        const Icon = q.icon;
        return (
          <div key={q.key} className={cn('rounded-2xl border p-5', q.wrap)}>
            <div className={cn('mb-3 flex items-center gap-2 font-bold', q.chip)}>
              <Icon className="h-5 w-5" />
              <span>{q.label}</span>
            </div>
            {items.length > 0 ? (
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', q.dot)} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No data available.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
