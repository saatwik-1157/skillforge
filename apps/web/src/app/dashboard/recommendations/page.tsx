'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Wallet,
  ArrowRight,
  TrendingUp,
  Compass,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, SkeletonCards, EmptyState } from '@/components/shared/states';
import { api } from '@/lib/api';
import { cn, formatINR } from '@/lib/utils';
import { toast } from 'sonner';

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type BusinessType = 'HOME' | 'ONLINE' | 'OFFLINE' | 'HYBRID';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface RecommendedBusiness {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  description: string;
  difficulty: Difficulty;
  businessType: BusinessType;
  minInvestment: number;
  maxInvestment: number;
  expectedProfit: string;
  estimatedTime: string;
  growthPotential: 'LOW' | 'MEDIUM' | 'HIGH';
  coverImage?: string | null;
  category?: Category | null;
  matchScore: number;
  matchedSkills: string[];
}

const TYPE_LABEL: Record<BusinessType, string> = {
  HOME: 'Home-based',
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  HYBRID: 'Hybrid',
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

/** Circular match-score ring, color-graded by score. */
function ScoreRing({ value }: { value: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const dash = `${(value / 100) * circumference} ${circumference}`;
  const stroke =
    value >= 75 ? 'stroke-emerald-500' : value >= 50 ? 'stroke-primary' : 'stroke-amber-500';
  const text =
    value >= 75 ? 'text-emerald-600' : value >= 50 ? 'text-primary' : 'text-amber-600';
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} className="fill-none stroke-muted" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          className={cn('fill-none transition-all', stroke)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={dash}
        />
      </svg>
      <span
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center font-extrabold leading-none',
          text,
        )}
      >
        <span className="text-lg">{value}</span>
        <span className="text-[9px] font-semibold text-muted-foreground">match</span>
      </span>
    </div>
  );
}

function RecommendationCard({ b }: { b: RecommendedBusiness }) {
  return (
    <Card className="flex h-full flex-col rounded-2xl transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <ScoreRing value={b.matchScore} />
          <div className="min-w-0 flex-1">
            {b.category && (
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-primary">
                {b.category.name}
              </p>
            )}
            <h3 className="mt-0.5 truncate text-base font-bold">{b.title}</h3>
            {b.tagline && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{b.tagline}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">{TYPE_LABEL[b.businessType]}</Badge>
          <Badge variant="outline">{DIFFICULTY_LABEL[b.difficulty]}</Badge>
          {b.growthPotential === 'HIGH' && (
            <Badge variant="success">
              <TrendingUp className="mr-1 h-3 w-3" /> High growth
            </Badge>
          )}
        </div>

        {/* Investment */}
        <div className="flex items-center gap-2 text-sm">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">
            {formatINR(b.minInvestment)} – {formatINR(b.maxInvestment)}
          </span>
          <span className="text-muted-foreground">to start</span>
        </div>

        {/* Matched skills */}
        {b.matchedSkills.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">
              Matches your skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {b.matchedSkills.slice(0, 5).map((s) => (
                <Badge key={s} variant="default">
                  {s}
                </Badge>
              ))}
              {b.matchedSkills.length > 5 && (
                <Badge variant="muted">+{b.matchedSkills.length - 5}</Badge>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/businesses/${b.slug}`}>
              View idea <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecommendationsPage() {
  const [items, setItems] = React.useState<RecommendedBusiness[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .post<{ items: RecommendedBusiness[] }>('/businesses/recommend', {})
      .then((res) => setItems(res.data.items))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load recommendations';
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Your Recommended Businesses"
        description="Ranked by how well each idea fits your skills, budget and goals."
      >
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </Button>
      </PageHeader>

      {loading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <EmptyState
          icon={Sparkles}
          title="We couldn't load your recommendations"
          description={error}
          actionLabel="Complete your assessment"
          actionHref="/onboarding"
        />
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No recommendations yet"
          description="Complete your entrepreneur assessment so we can match you with the best-fit business ideas."
          actionLabel="Start assessment"
          actionHref="/onboarding"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <RecommendationCard key={b.id} b={b} />
          ))}
        </div>
      )}
    </div>
  );
}
