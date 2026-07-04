'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Video,
  FileText,
  FileType2,
  LayoutTemplate,
  BookOpen,
  ListChecks,
  PlayCircle,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner, EmptyState } from '@/components/shared/states';
import { api, ApiClientError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { toast } from 'sonner';

type ResourceType = 'VIDEO' | 'ARTICLE' | 'PDF' | 'TEMPLATE' | 'WORKSHEET' | 'CHECKLIST';
type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

interface Lesson {
  id: string;
  order: number;
  title: string;
  durationMin: number | null;
}

interface ResourceDetail {
  id: string;
  title: string;
  slug: string;
  type: ResourceType;
  description: string | null;
  body: string | null;
  contentUrl: string | null;
  thumbnail: string | null;
  durationMin: number | null;
  difficulty: Difficulty;
  category: { id: string; name: string; slug: string } | null;
  lessons: Lesson[];
}

interface ResourceResponse {
  resource: ResourceDetail;
}

const TYPE_META: Record<
  ResourceType,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  VIDEO: { label: 'Video', icon: Video },
  ARTICLE: { label: 'Article', icon: FileText },
  PDF: { label: 'PDF', icon: FileType2 },
  TEMPLATE: { label: 'Template', icon: LayoutTemplate },
  WORKSHEET: { label: 'Worksheet', icon: BookOpen },
  CHECKLIST: { label: 'Checklist', icon: ListChecks },
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export default function ResourceDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [resource, setResource] = React.useState<ResourceDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [enrolling, setEnrolling] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    api
      .get<ResourceResponse>(`/learning/resources/${slug}`, { auth: false })
      .then((res) => {
        if (!cancelled) setResource(res.data.resource);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiClientError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err?.message ?? 'Failed to load resource');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleEnroll() {
    if (!resource) return;
    if (!user) {
      toast.error('Please log in to enrol in this course.');
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/learning/resources/${resource.id}/enroll`);
      toast.success('Enrolled! Redirecting to your learning…');
      router.push('/dashboard/learning');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not enrol');
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="container-page py-12">
        <Spinner />
      </div>
    );
  }

  if (notFound || (!resource && !error)) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={GraduationCap}
          title="Resource not found"
          description="This learning resource may have been removed or unpublished."
          actionLabel="Browse the library"
          actionHref="/learning"
        />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={GraduationCap}
          title="Couldn’t load resource"
          description={error ?? 'Something went wrong.'}
          actionLabel="Back to library"
          actionHref="/learning"
        />
      </div>
    );
  }

  const meta = TYPE_META[resource.type];
  const TypeIcon = meta.icon;
  const isArticle = resource.type === 'ARTICLE';

  return (
    <div className="container-page py-12">
      <Link
        href="/learning"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="navy" className="gap-1">
                <TypeIcon className="h-3 w-3" />
                {meta.label}
              </Badge>
              <Badge variant="muted">{DIFFICULTY_LABEL[resource.difficulty]}</Badge>
              {resource.category && (
                <Badge variant="outline">{resource.category.name}</Badge>
              )}
              {resource.durationMin != null && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {resource.durationMin} min
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {resource.title}
            </h1>
            {resource.description && (
              <p className="text-lg text-muted-foreground">{resource.description}</p>
            )}
          </div>

          {/* Article body */}
          {isArticle && resource.body && (
            <Card>
              <CardContent className="py-6">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {resource.body}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lessons */}
          {resource.lessons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Lessons ({resource.lessons.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {resource.lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted/50"
                  >
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <PlayCircle className="h-4 w-4 flex-none text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">{lesson.title}</span>
                    {lesson.durationMin != null && (
                      <span className="flex-none text-xs text-muted-foreground">
                        {lesson.durationMin} min
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar / enroll */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 overflow-hidden">
            <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              {resource.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resource.thumbnail}
                  alt={resource.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <TypeIcon className="h-12 w-12 text-primary/40" />
              )}
            </div>
            <CardContent className="space-y-4 py-6">
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Level</span>
                  <span className="font-medium text-foreground">
                    {DIFFICULTY_LABEL[resource.difficulty]}
                  </span>
                </div>
                {resource.durationMin != null && (
                  <div className="flex items-center justify-between">
                    <span>Duration</span>
                    <span className="font-medium text-foreground">
                      {resource.durationMin} min
                    </span>
                  </div>
                )}
                {resource.lessons.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Lessons</span>
                    <span className="font-medium text-foreground">
                      {resource.lessons.length}
                    </span>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling…' : 'Enroll'}
              </Button>

              {!user && (
                <p className="text-center text-xs text-muted-foreground">
                  You need an account to enrol.{' '}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
