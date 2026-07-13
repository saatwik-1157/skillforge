'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Star, Users2, Languages as LanguagesIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageHeader, SkeletonCards, EmptyState } from '@/components/shared/states';

interface MentorUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface MentorProfile {
  id: string;
  headline: string;
  expertise: string[];
  languages: string[];
  yearsExperience: number;
  hourlyRate: number;
  ratingAvg: number;
  ratingCount: number;
  user: MentorUser;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MentorsPage() {
  const [mentors, setMentors] = React.useState<MentorProfile[]>([]);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Applied filter values (drive the fetch).
  const [q, setQ] = React.useState('');
  const [expertise, setExpertise] = React.useState('');
  const [language, setLanguage] = React.useState('');
  const [page, setPage] = React.useState(1);

  // Local search-box value; only applied on submit.
  const [qInput, setQInput] = React.useState('');

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (expertise) params.set('expertise', expertise);
    if (language) params.set('language', language);
    params.set('page', String(page));
    params.set('limit', '12');

    api
      .get<{ items: MentorProfile[] }>(`/mentors?${params.toString()}`, { auth: false })
      .then((res) => {
        if (!active) return;
        setMentors(res.data.items);
        setPagination(res.meta?.pagination ?? null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message ?? 'Failed to load mentors');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [q, expertise, language, page]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQ(qInput.trim());
  }

  function clearFilters() {
    setQInput('');
    setQ('');
    setExpertise('');
    setLanguage('');
    setPage(1);
  }

  const hasFilters = Boolean(q || expertise || language);

  return (
    <div className="container-page py-12">
      <PageHeader
        title="Find a mentor"
        description="Connect with verified mentors to accelerate your entrepreneurial journey."
      />

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search by name, headline or skill…"
            className="pl-9"
          />
        </form>
        <Input
          value={expertise}
          onChange={(e) => {
            setPage(1);
            setExpertise(e.target.value);
          }}
          placeholder="Expertise (e.g. Marketing)"
          className="sm:w-56"
        />
        <Input
          value={language}
          onChange={(e) => {
            setPage(1);
            setLanguage(e.target.value);
          }}
          placeholder="Language (e.g. Hindi)"
          className="sm:w-48"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <EmptyState
          icon={Users2}
          title="Couldn't load mentors"
          description={error}
        />
      ) : mentors.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No mentors found"
          description={
            hasFilters
              ? 'Try adjusting your filters to see more mentors.'
              : 'Check back soon — mentors are being onboarded.'
          }
        />
      ) : (
        <>
          <h2 className="sr-only">Mentors</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((m) => (
              <MentorCard key={m.id} mentor={m} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MentorCard({ mentor }: { mentor: MentorProfile }) {
  return (
    <Link href={`/mentors/${mentor.id}`} className="group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar src={mentor.user.avatarUrl ?? undefined} name={mentor.user.name} />
          <div className="min-w-0">
            <h3 className="truncate font-bold group-hover:text-primary">
              {mentor.user.name}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {mentor.headline}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {mentor.expertise.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
            {mentor.expertise.length > 4 && (
              <Badge variant="outline">+{mentor.expertise.length - 4}</Badge>
            )}
          </div>

          {mentor.languages.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <LanguagesIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{mentor.languages.join(', ')}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {mentor.ratingCount > 0 ? (
                <>
                  <span className="font-semibold">{mentor.ratingAvg.toFixed(1)}</span>
                  <span className="text-muted-foreground">({mentor.ratingCount})</span>
                </>
              ) : (
                <span className="text-muted-foreground">No reviews yet</span>
              )}
            </div>
            <span className="text-sm font-semibold">
              {mentor.hourlyRate > 0 ? `${formatINR(mentor.hourlyRate)}/hr` : 'Free'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
