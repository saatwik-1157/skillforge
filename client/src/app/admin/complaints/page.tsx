'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageSquareWarning } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiClientError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner, EmptyState, PageHeader } from '@/components/shared/states';
import { AdminPagination, type Pagination } from '@/components/shared/admin-pagination';

type ComplaintStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
const STATUSES: ComplaintStatus[] = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'];

const statusVariant: Record<ComplaintStatus, 'default' | 'success' | 'muted' | 'navy'> = {
  OPEN: 'default',
  IN_REVIEW: 'navy',
  RESOLVED: 'success',
  DISMISSED: 'muted',
};

interface Complaint {
  id: string;
  subject: string;
  body: string;
  status: ComplaintStatus;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminComplaintsPage() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '20');
      const res = await api.get<{ items: Complaint[] }>(`/admin/complaints?${params.toString()}`);
      setItems(res.data.items);
      setPagination(res.meta?.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(complaint: Complaint, status: ComplaintStatus) {
    const prev = complaint.status;
    setSavingId(complaint.id);
    setItems((list) => list.map((c) => (c.id === complaint.id ? { ...c, status } : c)));
    try {
      await api.patch(`/admin/complaints/${complaint.id}`, { status });
      toast.success('Complaint updated');
    } catch (err) {
      setItems((list) => list.map((c) => (c.id === complaint.id ? { ...c, status: prev } : c)));
      toast.error(err instanceof ApiClientError ? err.message : 'Update failed');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <PageHeader title="Complaints" description="Triage and resolve user-submitted complaints." />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as ComplaintStatus | '');
          }}
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon={MessageSquareWarning} title="Couldn't load complaints" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No complaints"
          description="There are no complaints matching this filter."
        />
      ) : (
        <>
          <div className="space-y-4">
            {items.map((c) => (
              <Card key={c.id} className="rounded-2xl">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{c.subject}</h3>
                      <Badge variant={statusVariant[c.status]}>{c.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {c.user.name} · {c.user.email} · {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Update status
                    </label>
                    <select
                      value={c.status}
                      disabled={savingId === c.id}
                      onChange={(e) => changeStatus(c, e.target.value as ComplaintStatus)}
                      className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm disabled:opacity-50 sm:w-44"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
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
