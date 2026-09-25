'use client';

import * as React from 'react';
import Link from 'next/link';
import { Map, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PageHeader, SkeletonCards, EmptyState } from '@/components/shared/states';
import { api } from '@/lib/api';

interface UserRoadmapListItem {
  id: string;
  roadmapId: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  roadmap: {
    id: string;
    title: string;
    description: string | null;
    business: { id: string; title: string; slug: string };
  };
}

export default function RoadmapsPage() {
  const [items, setItems] = React.useState<UserRoadmapListItem[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    api
      .get<{ items: UserRoadmapListItem[] }>('/roadmaps/me')
      .then((res) => {
        if (active) setItems(res.data.items);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? 'Failed to load your roadmaps');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Your Roadmaps"
        description="Step-by-step plans to turn each business idea into a launched venture."
      />

      {loading ? (
        <SkeletonCards count={3} />
      ) : error ? (
        <EmptyState
          icon={Map}
          title="Couldn't load your roadmaps"
          description={error}
        />
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No roadmaps yet"
          description="Pick a business idea and start its roadmap to track your progress here."
          actionLabel="Browse business ideas"
          actionHref="/businesses"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((item) => {
            const isDone = item.progress >= 100;
            return (
              <Link
                key={item.id}
                href={`/dashboard/roadmaps/${item.roadmap.id}`}
                className="group"
              >
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug">
                        {item.roadmap.business?.title ?? item.roadmap.title}
                      </CardTitle>
                      {isDone ? (
                        <Badge variant="success" className="shrink-0 gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </Badge>
                      ) : (
                        <Badge variant="muted" className="shrink-0">
                          {item.progress}%
                        </Badge>
                      )}
                    </div>
                    {item.roadmap.title !== item.roadmap.business?.title && (
                      <p className="text-sm text-muted-foreground">
                        {item.roadmap.title}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={item.progress} />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{item.progress}% complete</span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Continue <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {items && items.length > 0 && (
        <div className="pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/businesses">Explore more ideas</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
