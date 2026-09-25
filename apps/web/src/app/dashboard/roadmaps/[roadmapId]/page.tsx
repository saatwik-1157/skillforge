'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Map,
  ArrowLeft,
  Check,
  Circle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Spinner, EmptyState } from '@/components/shared/states';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type StepStatus = 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

interface UserRoadmapStep {
  id: string;
  status: StepStatus;
  completedAt: string | null;
  step: {
    id: string;
    order: number;
    title: string;
    description: string | null;
    resourceUrl: string | null;
  };
}

interface UserRoadmapDetail {
  id: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  roadmap: {
    id: string;
    title: string;
    description: string | null;
    business: { id: string; title: string; slug: string };
  };
  steps: UserRoadmapStep[];
}

interface UpdateStepResponse {
  step: { id: string; status: StepStatus; completedAt: string | null };
  progress: number;
  completedAt: string | null;
}

// NOT_STARTED -> IN_PROGRESS -> COMPLETED -> NOT_STARTED
const NEXT_STATUS: Record<StepStatus, StepStatus> = {
  LOCKED: 'IN_PROGRESS',
  NOT_STARTED: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: 'NOT_STARTED',
};

const STATUS_LABEL: Record<StepStatus, string> = {
  LOCKED: 'Locked',
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

export default function RoadmapDetailPage() {
  const params = useParams<{ roadmapId: string }>();
  const roadmapId = params.roadmapId;

  const [detail, setDetail] = React.useState<UserRoadmapDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!roadmapId) return;
    let active = true;
    setLoading(true);
    api
      .get<{ userRoadmap: UserRoadmapDetail }>(`/roadmaps/me/${roadmapId}`)
      .then((res) => {
        if (active) setDetail(res.data.userRoadmap);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? 'Failed to load this roadmap');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [roadmapId]);

  async function cycleStep(step: UserRoadmapStep) {
    if (savingId) return;
    const nextStatus = NEXT_STATUS[step.status];
    setSavingId(step.id);
    try {
      const res = await api.patch<UpdateStepResponse>(
        `/roadmaps/me/steps/${step.id}`,
        { status: nextStatus },
      );
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          progress: res.data.progress,
          completedAt: res.data.completedAt,
          steps: prev.steps.map((s) =>
            s.id === step.id
              ? { ...s, status: res.data.step.status, completedAt: res.data.step.completedAt }
              : s,
          ),
        };
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not update this step',
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <BackLink />
        <EmptyState
          icon={Map}
          title="Roadmap not available"
          description={error ?? 'You have not started this roadmap yet.'}
          actionLabel="Browse business ideas"
          actionHref="/businesses"
        />
      </div>
    );
  }

  const steps = [...detail.steps].sort((a, b) => a.step.order - b.step.order);
  const completedCount = steps.filter((s) => s.status === 'COMPLETED').length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink />

      {/* Gradient progress header */}
      <div className="relative overflow-hidden rounded-3xl gradient-warm p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/80">Your roadmap</p>
            <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
              {detail.roadmap.business?.title ?? detail.roadmap.title}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {completedCount} of {steps.length} steps completed
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-extrabold tabular-nums">{detail.progress}%</span>
            {detail.progress >= 100 && (
              <p className="text-sm font-semibold text-white/90">🎉 Completed!</p>
            )}
          </div>
        </div>
        <div className="relative mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${detail.progress}%` }}
          />
        </div>
      </div>

      {/* Vertical stepper */}
      {steps.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No steps yet"
          description="This roadmap doesn't have any steps."
        />
      ) : (
        <ol className="relative space-y-0">
          {steps.map((s, i) => {
            const isCompleted = s.status === 'COMPLETED';
            const isInProgress = s.status === 'IN_PROGRESS';
            const isLast = i === steps.length - 1;
            const saving = savingId === s.id;

            return (
              <li key={s.id} className="relative flex gap-4 pb-6">
                {/* connector line */}
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-4 top-9 -ml-px h-[calc(100%-1.25rem)] w-0.5',
                      isCompleted ? 'bg-gradient-to-b from-primary to-orange-400' : 'bg-border',
                    )}
                  />
                )}

                {/* node */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                    isCompleted
                      ? 'gradient-warm border-transparent text-white shadow-lg shadow-primary/30'
                      : isInProgress
                        ? 'animate-pulse border-primary bg-primary/10 text-orange-700 dark:text-primary ring-4 ring-primary/15'
                        : 'border-border bg-background text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{s.step.order}</span>
                  )}
                </div>

                {/* content */}
                <Card className="flex-1">
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <h3
                        className={cn(
                          'font-semibold leading-snug',
                          isCompleted && 'text-muted-foreground line-through',
                        )}
                      >
                        {s.step.title}
                      </h3>
                      {s.step.description && (
                        <p
                          className={cn(
                            'text-sm text-muted-foreground',
                            isCompleted && 'line-through',
                          )}
                        >
                          {s.step.description}
                        </p>
                      )}
                      {s.step.resourceUrl && (
                        <a
                          href={s.step.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Resource <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant={isCompleted ? 'secondary' : isInProgress ? 'default' : 'outline'}
                      size="sm"
                      disabled={saving}
                      onClick={() => cycleStep(s)}
                      className="shrink-0 gap-1.5"
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                      {STATUS_LABEL[s.status]}
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Tip: tap a step&apos;s status to cycle it Not started → In progress → Completed.
      </p>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/dashboard/roadmaps"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> All roadmaps
    </Link>
  );
}
