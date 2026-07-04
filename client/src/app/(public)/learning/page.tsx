'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Video,
  FileText,
  FileType2,
  LayoutTemplate,
  ListChecks,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState, SkeletonCards } from '@/components/shared/states';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type ResourceType = 'VIDEO' | 'ARTICLE' | 'PDF' | 'TEMPLATE' | 'WORKSHEET' | 'CHECKLIST';
type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
}

interface LearningResource {
  id: string;
  title: string;
  slug: string;
  type: ResourceType;
  description: string | null;
  thumbnail: string | null;
  durationMin: number | null;
  difficulty: Difficulty;
  category: ResourceCategory | null;
}

interface ListResponse {
  items: LearningResource[];
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

const TYPE_FILTERS: ResourceType[] = [
  'VIDEO',
  'ARTICLE',
  'PDF',
  'TEMPLATE',
  'WORKSHEET',
  'CHECKLIST',
];

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

function ResourceCard({ resource }: { resource: LearningResource }) {
  const meta = TYPE_META[resource.type];
  const Icon = meta.icon;

  return (
    <Link href={`/learning/${resource.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
          {resource.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resource.thumbnail}
              alt={resource.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon className="h-12 w-12 text-primary/40" />
          )}
          <Badge variant="navy" className="absolute left-3 top-3 gap-1">
            <Icon className="h-3 w-3" />
            {meta.label}
          </Badge>
        </div>
        <CardContent className="space-y-2 py-5">
          <h3 className="line-clamp-2 font-bold leading-snug group-hover:text-primary">
            {resource.title}
          </h3>
          {resource.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {resource.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <Badge variant="muted">{DIFFICULTY_LABEL[resource.difficulty]}</Badge>
            {resource.durationMin != null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {resource.durationMin} min
              </span>
            )}
            {resource.category && <span>· {resource.category.name}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function LearningPage() {
  const [items, setItems] = React.useState<LearningResource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Committed search term used in the query; input holds the live text.
  const [searchInput, setSearchInput] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [activeType, setActiveType] = React.useState<ResourceType | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (activeType) params.set('type', activeType);
    const qs = params.toString();

    api
      .get<ListResponse>(`/learning/resources${qs ? `?${qs}` : ''}`, { auth: false })
      .then((res) => {
        if (!cancelled) setItems(res.data.items ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load resources');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, activeType]);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQuery(searchInput.trim());
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Learning Library</h1>
        <p className="mt-2 text-muted-foreground">
          Courses, templates and guides to take you from skill to enterprise.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={onSearchSubmit} className="mb-4 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search resources…"
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Type filter chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveType(null)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            activeType === null
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
          )}
        >
          All
        </button>
        {TYPE_FILTERS.map((t) => {
          const meta = TYPE_META[t];
          const Icon = meta.icon;
          const active = activeType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActiveType(active ? null : t)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <EmptyState
          icon={GraduationCap}
          title="Couldn’t load resources"
          description={error}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No resources found"
          description="Try a different search term or filter."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}
