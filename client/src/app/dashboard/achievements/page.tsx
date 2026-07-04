'use client';

import * as React from 'react';
import { Trophy, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, SkeletonCards, EmptyState } from '@/components/shared/states';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string | null;
  points: number;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AchievementsPage() {
  const [items, setItems] = React.useState<UserAchievement[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    api
      .get<{ items: UserAchievement[] }>('/users/me/achievements')
      .then((res) => {
        if (active) setItems(res.data.items);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? 'Failed to load achievements');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalPoints = items?.reduce((sum, ua) => sum + (ua.achievement.points ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Achievements"
        description="Badges you've unlocked on your entrepreneurial journey."
      >
        {items && items.length > 0 && (
          <Badge variant="default" className="gap-1.5">
            <Star className="h-3.5 w-3.5" /> {totalPoints} points
          </Badge>
        )}
      </PageHeader>

      {loading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <EmptyState icon={Trophy} title="Couldn't load achievements" description={error} />
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No achievements yet"
          description="Complete courses, finish roadmaps and engage with the community to start earning badges."
          actionLabel="Explore learning"
          actionHref="/resources"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((ua, i) => {
            const grads = [
              'gradient-warm',
              'bg-gradient-to-br from-sky-500 to-indigo-500',
              'bg-gradient-to-br from-emerald-500 to-teal-500',
              'bg-gradient-to-br from-violet-500 to-purple-500',
              'bg-gradient-to-br from-rose-500 to-pink-500',
              'bg-gradient-to-br from-amber-500 to-orange-500',
            ];
            const grad = grads[i % grads.length];
            return (
            <Card
              key={ua.achievementId}
              className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent"
            >
              <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1.5', grad)} />
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className={cn('tile mb-4 h-16 w-16 text-3xl', grad)}>
                  {ua.achievement.icon ? (
                    <span aria-hidden>{ua.achievement.icon}</span>
                  ) : (
                    <Trophy className="h-8 w-8" />
                  )}
                </div>
                <h3 className="text-base font-bold">{ua.achievement.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{ua.achievement.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="success" className="gap-1">
                    <Star className="h-3 w-3" /> {ua.achievement.points} pts
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(ua.unlockedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
