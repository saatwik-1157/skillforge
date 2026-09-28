'use client';

import { useCallback, useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiClientError } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner, EmptyState, PageHeader } from '@/components/shared/states';
import { AdminPagination, type Pagination } from '@/components/shared/admin-pagination';

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  author?: { id: string; name: string } | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ items: Announcement[] }>(
        `/admin/announcements?page=${page}&limit=10`,
      );
      setItems(res.data.items);
      setPagination(res.meta?.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (trimmedTitle.length < 2) {
      toast.error('Title must be at least 2 characters');
      return;
    }
    if (trimmedBody.length < 1) {
      toast.error('Body is required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/admin/announcements', { title: trimmedTitle, body: trimmedBody });
      toast.success('Announcement published');
      setTitle('');
      setBody('');
      setPage(1);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to publish');
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success('Announcement deleted');
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Broadcast platform-wide announcements to your community."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Create form */}
        <Card className="h-fit rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">New announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Scheduled maintenance…"
                  maxLength={160}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share the details…"
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                <Plus className="h-4 w-4" />
                {creating ? 'Publishing…' : 'Publish announcement'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div>
          {loading ? (
            <Spinner />
          ) : error ? (
            <EmptyState icon={Megaphone} title="Couldn't load announcements" description={error} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No announcements yet"
              description="Create your first announcement using the form."
            />
          ) : (
            <>
              <div className="space-y-4">
                {items.map((a) => (
                  <Card key={a.id} className="rounded-2xl">
                    <CardContent className="flex items-start justify-between gap-4 p-5">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold">{a.title}</h3>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">
                          {a.body}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {a.author?.name ? `${a.author.name} · ` : ''}
                          {formatDate(a.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive"
                        disabled={deletingId === a.id}
                        onClick={() => remove(a.id)}
                        aria-label="Delete announcement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pagination && <AdminPagination pagination={pagination} onPageChange={setPage} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
