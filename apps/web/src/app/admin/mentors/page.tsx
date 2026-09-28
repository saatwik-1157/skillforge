'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Check, X, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiClientError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Spinner, EmptyState, PageHeader } from '@/components/shared/states';
import { AdminPagination, type Pagination } from '@/components/shared/admin-pagination';
import { formatINR } from '@/lib/utils';

interface PendingMentor {
  id: string;
  headline: string;
  expertise: string[];
  yearsExperience: number;
  languages: string[];
  hourlyRate: number;
  createdAt: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
}

export default function AdminMentorsPage() {
  const [items, setItems] = useState<PendingMentor[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ items: PendingMentor[] }>(
        `/admin/mentors/pending?page=${page}&limit=12`,
      );
      setItems(res.data.items);
      setPagination(res.meta?.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function verify(mentor: PendingMentor, status: 'VERIFIED' | 'REJECTED') {
    setActingId(mentor.id);
    try {
      await api.patch(`/admin/mentors/${mentor.id}/verify`, { status });
      toast.success(status === 'VERIFIED' ? 'Mentor approved' : 'Mentor rejected');
      // Remove from the pending list.
      setItems((prev) => prev.filter((m) => m.id !== mentor.id));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Action failed');
    } finally {
      setActingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Mentor verification"
        description="Review and approve mentors awaiting verification."
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon={ShieldCheck} title="Couldn't load mentors" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="All caught up"
          description="There are no mentors pending verification right now."
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((m) => (
              <Card key={m.id} className="flex flex-col rounded-2xl">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start gap-3">
                    <Avatar src={m.user.avatarUrl ?? undefined} name={m.user.name} className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{m.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
                    </div>
                    <Badge variant="default">Pending</Badge>
                  </div>

                  <p className="mt-4 text-sm font-medium">{m.headline}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.expertise.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {m.yearsExperience} yrs experience
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {m.hourlyRate > 0 ? `${formatINR(m.hourlyRate)}/hr` : 'Free'}
                    </span>
                  </div>

                  {m.languages.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Languages: {m.languages.join(', ')}
                    </p>
                  )}

                  <div className="mt-5 flex gap-2 border-t border-border pt-4">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={actingId === m.id}
                      onClick={() => verify(m, 'VERIFIED')}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive"
                      disabled={actingId === m.id}
                      onClick={() => verify(m, 'REJECTED')}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && <AdminPagination pagination={pagination} onPageChange={setPage} />}
        </>
      )}
    </>
  );
}
