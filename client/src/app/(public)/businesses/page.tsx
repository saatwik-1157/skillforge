'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Rocket,
  Store,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatINR } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonCards, EmptyState } from '@/components/shared/states';
import {
  BUSINESS_TYPE_LABELS,
  DIFFICULTY_LABELS,
  type BusinessListItem,
  type BusinessType,
  type Category,
  type Difficulty,
} from './types';

const BUSINESS_TYPES: BusinessType[] = ['HOME', 'ONLINE', 'OFFLINE', 'HYBRID'];
const DIFFICULTIES: Difficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const PAGE_LIMIT = 9;

interface Filters {
  q: string;
  categorySlug: string;
  businessType: string;
  difficulty: string;
  minBudget: string;
  maxBudget: string;
}

const EMPTY_FILTERS: Filters = {
  q: '',
  categorySlug: '',
  businessType: '',
  difficulty: '',
  minBudget: '',
  maxBudget: '',
};

function growthVariant(g: BusinessListItem['growthPotential']) {
  return g === 'HIGH' ? 'success' : g === 'MEDIUM' ? 'default' : 'muted';
}

export default function BusinessesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);

  // Committed filters (drive the fetch) vs the live search input.
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = React.useState('');
  const [page, setPage] = React.useState(1);

  const [items, setItems] = React.useState<BusinessListItem[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load categories once (public endpoint).
  React.useEffect(() => {
    api
      .get<{ items: Category[] }>('/businesses/categories', { auth: false })
      .then((res) => setCategories(res.data.items))
      .catch(() => setCategories([]));
  }, []);

  // Debounce the search box into the committed filters.
  React.useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.q === searchInput ? f : { ...f, q: searchInput }));
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch the catalog whenever committed filters or page change.
  React.useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_LIMIT));
    if (filters.q) params.set('q', filters.q);
    if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);
    if (filters.businessType) params.set('businessType', filters.businessType);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.minBudget) params.set('minBudget', filters.minBudget);
    if (filters.maxBudget) params.set('maxBudget', filters.maxBudget);

    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<{ items: BusinessListItem[] }>(`/businesses?${params.toString()}`, { auth: false })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data.items);
        setTotal(res.meta?.pagination?.total ?? res.data.items.length);
        setTotalPages(res.meta?.pagination?.totalPages ?? 1);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load business ideas');
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  function updateFilter<K extends keyof Filters>(key: K, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setSearchInput('');
    setPage(1);
  }

  const activeFilterCount = [
    filters.categorySlug,
    filters.businessType,
    filters.difficulty,
    filters.minBudget,
    filters.maxBudget,
  ].filter(Boolean).length;

  return (
    <div className="container-page py-12 sm:py-16">
      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-orange-700 dark:text-primary">
          <Sparkles className="h-4 w-4" />
          Explore proven business ideas
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Find a business idea that fits you
        </h1>
        <p className="mt-3 text-muted-foreground">
          Browse curated, low-to-mid investment businesses with full playbooks — investment
          breakdowns, market demand, roadmaps and more.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filter sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              {(activeFilterCount > 0 || filters.q) && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="q">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="q"
                  placeholder="Cloud kitchen, tutoring…"
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="mt-5 space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={filters.categorySlug}
                onChange={(e) => updateFilter('categorySlug', e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} ({c.businessCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Business type */}
            <div className="mt-5 space-y-2">
              <Label>Business type</Label>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_TYPES.map((t) => {
                  const active = filters.businessType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => updateFilter('businessType', active ? '' : t)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {BUSINESS_TYPE_LABELS[t]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mt-5 space-y-2">
              <Label>Difficulty</Label>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => {
                  const active = filters.difficulty === d;
                  return (
                    <button
                      key={d}
                      onClick={() => updateFilter('difficulty', active ? '' : d)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="mt-5 space-y-2">
              <Label>Budget (₹)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={filters.minBudget}
                  onChange={(e) => updateFilter('minBudget', e.target.value)}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={filters.maxBudget}
                  onChange={(e) => updateFilter('maxBudget', e.target.value)}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Searching…' : `${total} business ${total === 1 ? 'idea' : 'ideas'} found`}
            </p>
          </div>

          {loading ? (
            <SkeletonCards count={6} />
          ) : error ? (
            <EmptyState
              icon={Store}
              title="Couldn't load business ideas"
              description={error}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No business ideas match your filters"
              description="Try widening your budget range or clearing a filter to see more ideas."
            />
          ) : (
            <>
              <h2 className="sr-only">Business ideas</h2>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((b) => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BusinessCard({ business: b }: { business: BusinessListItem }) {
  return (
    <Card className="group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-lg">
      <Link href={`/businesses/${b.slug}`} className="cover block h-40 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.coverImage ?? `https://picsum.photos/seed/sf-${b.slug}/640/360`}
          alt={b.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {b.category && (
          <Badge className="absolute left-3 top-3 z-10 border-0 bg-black/45 text-white backdrop-blur-sm">
            {b.category.name}
          </Badge>
        )}
      </Link>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="navy">{DIFFICULTY_LABELS[b.difficulty]}</Badge>
          <Badge variant="outline">{BUSINESS_TYPE_LABELS[b.businessType]}</Badge>
        </div>
        <CardTitle className="text-lg leading-snug group-hover:text-primary">
          {b.title}
        </CardTitle>
        {b.tagline && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{b.tagline}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="rounded-xl bg-secondary/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">Investment</p>
          <p className="font-bold">
            {formatINR(b.minInvestment)}{' '}
            <span className="text-muted-foreground">–</span> {formatINR(b.maxInvestment)}
          </p>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <span className="font-medium">{b.expectedProfit}</span>
          </div>
        </div>
        <div>
          <Badge variant={growthVariant(b.growthPotential)}>
            <Rocket className="mr-1 h-3 w-3" />
            {b.growthPotential === 'HIGH'
              ? 'High growth'
              : b.growthPotential === 'MEDIUM'
                ? 'Medium growth'
                : 'Low growth'}
          </Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Link
          href={`/businesses/${b.slug}`}
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          View playbook
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div className="mt-10 flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const gap = prev !== undefined && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            <Button
              variant={p === page ? 'default' : 'ghost'}
              size="sm"
              className="min-w-9"
              onClick={() => onChange(p)}
            >
              {p}
            </Button>
          </React.Fragment>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
