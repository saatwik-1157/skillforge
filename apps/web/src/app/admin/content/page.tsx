'use client';

import { useCallback, useEffect, useState } from 'react';
import { Lightbulb, GraduationCap, Info } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiClientError } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Spinner, EmptyState, PageHeader } from '@/components/shared/states';

type ContentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
const STATUSES: ContentStatus[] = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];

const statusVariant: Record<ContentStatus, 'default' | 'success' | 'muted' | 'navy'> = {
  PUBLISHED: 'success',
  PENDING_REVIEW: 'default',
  DRAFT: 'navy',
  ARCHIVED: 'muted',
};

interface ContentItem {
  id: string;
  slug: string;
  title: string;
  status: ContentStatus;
}

/** Generic status-editable content list for one content kind. */
function ContentList({
  endpoint,
  patchBase,
  emptyIcon,
  emptyLabel,
}: {
  endpoint: string;
  patchBase: string; // e.g. '/admin/content/business'
  emptyIcon: React.ComponentType<{ className?: string }>;
  emptyLabel: string;
}) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ items: ContentItem[] }>(`${endpoint}?limit=50`);
      setItems(res.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(item: ContentItem, status: ContentStatus) {
    const prev = item.status;
    setSavingId(item.id);
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, status } : i)));
    try {
      await api.patch(`${patchBase}/${item.id}/status`, { status });
      toast.success('Status updated');
    } catch (err) {
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, status: prev } : i)));
      toast.error(err instanceof ApiClientError ? err.message : 'Update failed');
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon={emptyIcon} title="Couldn't load content" description={error} />;
  if (items.length === 0)
    return <EmptyState icon={emptyIcon} title={`No ${emptyLabel} found`} description="Nothing to moderate here yet." />;

  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Current</th>
              <th className="px-4 py-3 text-right font-medium">Set status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">/{item.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[item.status]}>{item.status.replace('_', ' ')}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <select
                      value={item.status}
                      disabled={savingId === item.id}
                      onChange={(e) => changeStatus(item, e.target.value as ContentStatus)}
                      className="h-9 rounded-lg border border-border bg-background px-2 text-sm disabled:opacity-50"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function AdminContentPage() {
  return (
    <>
      <PageHeader
        title="Content moderation"
        description="Review published businesses and learning resources and change their status."
      />

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          The public catalog only surfaces published items, so this view lists published content.
          Changing an item to Draft, Pending review, or Archived removes it from the catalog.
        </p>
      </div>

      <Tabs defaultValue="businesses">
        <TabsList>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses">
          <ContentList
            endpoint="/businesses"
            patchBase="/admin/content/business"
            emptyIcon={Lightbulb}
            emptyLabel="businesses"
          />
        </TabsContent>

        <TabsContent value="resources">
          <ContentList
            endpoint="/learning/resources"
            patchBase="/admin/content/resource"
            emptyIcon={GraduationCap}
            emptyLabel="resources"
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
