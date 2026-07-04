'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  Map,
  BookOpen,
  Users,
  MessageSquare,
  Award,
  FileText,
  Settings2,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Spinner, EmptyState } from '@/components/shared/states';
import { api, type ApiEnvelope } from '@/lib/api';
import { cn } from '@/lib/utils';

type NotificationType =
  | 'SYSTEM'
  | 'ROADMAP'
  | 'LEARNING'
  | 'MENTOR'
  | 'COMMUNITY'
  | 'ACHIEVEMENT'
  | 'CERTIFICATE';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface ListResponse {
  items: NotificationItem[];
}

const TYPE_ICON: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  SYSTEM: Settings2,
  ROADMAP: Map,
  LEARNING: BookOpen,
  MENTOR: Users,
  COMMUNITY: MessageSquare,
  ACHIEVEMENT: Award,
  CERTIFICATE: FileText,
};

const TYPE_GRAD: Record<NotificationType, string> = {
  SYSTEM: 'bg-gradient-to-br from-slate-500 to-slate-600',
  ROADMAP: 'gradient-warm',
  LEARNING: 'bg-gradient-to-br from-sky-500 to-indigo-500',
  MENTOR: 'bg-gradient-to-br from-violet-500 to-purple-500',
  COMMUNITY: 'bg-gradient-to-br from-fuchsia-500 to-pink-500',
  ACHIEVEMENT: 'bg-gradient-to-br from-amber-500 to-orange-500',
  CERTIFICATE: 'bg-gradient-to-br from-emerald-500 to-teal-500',
};

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const [items, setItems] = React.useState<NotificationItem[] | null>(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    api
      .get<ListResponse>('/notifications?limit=50')
      .then((res) => {
        if (!active) return;
        setItems(res.data.items);
        const meta = res.meta as ApiEnvelope<ListResponse>['meta'] & { unreadCount?: number };
        setUnreadCount(meta?.unreadCount ?? 0);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? 'Failed to load notifications');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function markRead(id: string) {
    const target = items?.find((n) => n.id === id);
    if (!target || target.isRead) return;
    setItems((prev) => prev?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? prev);
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not mark as read');
    }
  }

  async function markAllRead() {
    if (unreadCount === 0 || busy) return;
    setBusy(true);
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev?.map((n) => ({ ...n, isRead: true })) ?? prev);
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    const prev = items;
    const wasUnread = items?.find((n) => n.id === id)?.isRead === false;
    setItems((cur) => cur?.filter((n) => n.id !== id) ?? cur);
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      setItems(prev ?? null);
      if (wasUnread) setUnreadCount((c) => c + 1);
      toast.error(err instanceof Error ? err.message : 'Could not delete notification');
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates on your roadmaps, learning, mentors and community."
      >
        <div className="flex items-center gap-3">
          {unreadCount > 0 && <Badge variant="default">{unreadCount} unread</Badge>}
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={busy || unreadCount === 0}
            className="gap-1.5"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        </div>
      </PageHeader>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon={Bell} title="Couldn't load notifications" description={error} />
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="New notifications about your journey will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Bell;
            const body = (
              <div
                className={cn(
                  'flex items-start gap-4 rounded-2xl border border-border p-4 transition-colors',
                  !n.isRead && 'bg-primary/5',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    n.isRead
                      ? 'bg-muted text-muted-foreground'
                      : cn('tile text-white', TYPE_GRAD[n.type] ?? 'gradient-warm'),
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {!n.isRead && (
                        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                      <span className="truncate">{n.title}</span>
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>

                  <div className="mt-3 flex items-center gap-3">
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          void markRead(n.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        void remove(n.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );

            return (
              <li key={n.id}>
                {n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => void markRead(n.id)}
                    className="block hover:opacity-95"
                  >
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
