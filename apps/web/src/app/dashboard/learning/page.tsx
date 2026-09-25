'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Award,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PageHeader, Spinner, EmptyState } from '@/components/shared/states';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LessonInfo {
  id: string;
  order: number;
  title: string;
  durationMin: number | null;
}

interface LessonProgress {
  id: string;
  completed: boolean;
  lesson: LessonInfo;
}

interface EnrollmentResource {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
}

interface Enrollment {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  resource: EnrollmentResource;
  lessons: LessonProgress[];
}

interface EnrollmentsResponse {
  items: Enrollment[];
}

interface UpdateLessonResponse {
  enrollment: { id: string; progress: number; status: 'IN_PROGRESS' | 'COMPLETED' };
  certificate: { id: string } | null;
}

export default function DashboardLearningPage() {
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [pendingLesson, setPendingLesson] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<EnrollmentsResponse>('/learning/me/enrollments')
      .then((res) => {
        if (!cancelled) setEnrollments(res.data.items ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load your courses');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleExpanded(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function toggleLesson(
    enrollmentId: string,
    lessonProgressId: string,
    nextCompleted: boolean
  ) {
    setPendingLesson(lessonProgressId);
    try {
      const res = await api.patch<UpdateLessonResponse>(
        `/learning/me/lessons/${lessonProgressId}`,
        { completed: nextCompleted }
      );
      const updated = res.data.enrollment;

      setEnrollments((prev) =>
        prev.map((en) => {
          if (en.id !== enrollmentId) return en;
          return {
            ...en,
            progress: updated.progress,
            status: updated.status,
            lessons: en.lessons.map((lp) =>
              lp.id === lessonProgressId ? { ...lp, completed: nextCompleted } : lp
            ),
          };
        })
      );

      if (res.data.certificate) {
        toast.success('Course complete — certificate earned!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update lesson');
    } finally {
      setPendingLesson(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Continue Learning"
        description="Pick up where you left off and track your progress."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/learning">Browse library</Link>
        </Button>
      </PageHeader>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon={GraduationCap} title="Couldn’t load your courses" description={error} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Enrol in a course from the library to start learning."
          actionLabel="Browse library"
          actionHref="/learning"
        />
      ) : (
        <div className="space-y-5">
          {enrollments.map((en) => {
            const isOpen = expanded[en.id] ?? false;
            const isComplete = en.progress >= 100 || en.status === 'COMPLETED';
            const completedCount = en.lessons.filter((l) => l.completed).length;

            return (
              <Card key={en.id} className="overflow-hidden">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/learning/${en.resource.slug}`}
                          className="font-bold hover:text-primary"
                        >
                          {en.resource.title}
                        </Link>
                        {isComplete && (
                          <Link href="/dashboard/certificates">
                            <Badge variant="success" className="gap-1">
                              <Award className="h-3 w-3" />
                              Certificate earned
                            </Badge>
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {completedCount} of {en.lessons.length} lessons complete
                      </p>
                    </div>
                    <Badge variant={isComplete ? 'success' : 'muted'} className="flex-none">
                      {en.progress}%
                    </Badge>
                  </div>

                  <Progress value={en.progress} />

                  {en.lessons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(en.id)}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {isOpen ? 'Hide lessons' : 'Show lessons'}
                    </button>
                  )}
                </CardHeader>

                {isOpen && en.lessons.length > 0 && (
                  <CardContent className="space-y-1 border-t pt-4">
                    {en.lessons.map((lp) => {
                      const busy = pendingLesson === lp.id;
                      return (
                        <button
                          key={lp.id}
                          type="button"
                          disabled={busy}
                          onClick={() => toggleLesson(en.id, lp.id, !lp.completed)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/50 disabled:opacity-60',
                            lp.completed && 'text-muted-foreground'
                          )}
                        >
                          {lp.completed ? (
                            <CheckCircle2 className="h-5 w-5 flex-none text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 flex-none text-muted-foreground" />
                          )}
                          <span
                            className={cn(
                              'flex-1 text-sm font-medium',
                              lp.completed && 'line-through'
                            )}
                          >
                            {lp.lesson.title}
                          </span>
                          {lp.lesson.durationMin != null && (
                            <span className="flex-none text-xs text-muted-foreground">
                              {lp.lesson.durationMin} min
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
