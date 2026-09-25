'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bookmark as BookmarkIcon, Briefcase, BookOpen, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, Spinner, EmptyState } from '@/components/shared/states';
import { api } from '@/lib/api';

type BookmarkTarget = 'BUSINESS' | 'RESOURCE' | 'FORUM_POST';

interface Bookmark {
  id: string;
  target: BookmarkTarget;
  createdAt: string;
  business: {
    id: string;
    title: string;
    slug: string;
    tagline: string | null;
    coverImage: string | null;
  } | null;
  resource: {
    id: string;
    title: string;
    slug: string;
    type: string;
    thumbnail: string | null;
  } | null;
  post: { id: string; title: string; slug: string } | null;
}

interface ListResponse {
  items: Bookmark[];
}

const META: Record<
  BookmarkTarget,
  { label: string; icon: React.ComponentType<{ className?: string }>; grad: string }
> = {
  BUSINESS: { label: 'Business idea', icon: Briefcase, grad: 'gradient-warm' },
  RESOURCE: { label: 'Resource', icon: BookOpen, grad: 'bg-gradient-to-br from-sky-500 to-indigo-500' },
  FORUM_POST: { label: 'Discussion', icon: MessageSquare, grad: 'bg-gradient-to-br from-fuchsia-500 to-pink-500' },
};

function describe(b: Bookmark): { title: string; subtitle?: string | null; href: string } {
  if (b.target === 'BUSINESS' && b.business) {
    return {
      title: b.business.title,
      subtitle: b.business.tagline,
      href: `/businesses/${b.business.slug}`,
    };
  }
  if (b.target === 'RESOURCE' && b.resource) {
    return {
      title: b.resource.title,
      subtitle: b.resource.type,
      href: `/resources/${b.resource.slug}`,
    };
  }
  if (b.target === 'FORUM_POST' && b.post) {
    return { title: b.post.title, href: `/community/${b.post.slug}` };
  }
  return { title: 'Saved item', subtitle: 'No longer available', href: '#' };
}

export default function BookmarksPage() {
  const [items, setItems] = React.useState<Bookmark[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    api
      .get<ListResponse>('/users/me/bookmarks?limit=50')
      .then((res) => {
        if (alive) setItems(res.data.items);
      })
      .catch((err) => {
        if (alive) setError(err?.message ?? 'Failed to load bookmarks');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function remove(id: string) {
    const prev = items;
    setItems((cur) => cur?.filter((b) => b.id !== id) ?? cur);
    try {
      await api.delete(`/users/me/bookmarks/${id}`);
      toast.success('Removed from bookmarks');
    } catch (err) {
      setItems(prev ?? null);
      toast.error(err instanceof Error ? err.message : 'Could not remove bookmark');
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Bookmarks"
        description="Businesses, resources and discussions you've saved for later."
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon={BookmarkIcon} title="Couldn't load bookmarks" description={error} />
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={BookmarkIcon}
          title="No bookmarks yet"
          description="Save business ideas, resources and community posts to find them again here."
          actionLabel="Explore business ideas"
          actionHref="/businesses"
        />
      ) : (
        <ul className="space-y-3">
          {items.map((b) => {
            const { label, icon: Icon, grad } = META[b.target];
            const { title, subtitle, href } = describe(b);
            return (
              <li key={b.id}>
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`tile h-11 w-11 shrink-0 ${grad}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge variant="muted" className="mb-1">
                        {label}
                      </Badge>
                      {href === '#' ? (
                        <p className="truncate font-semibold">{title}</p>
                      ) : (
                        <Link
                          href={href}
                          className="block truncate font-semibold hover:text-primary hover:underline"
                        >
                          {title}
                        </Link>
                      )}
                      {subtitle && (
                        <p className="truncate text-sm capitalize text-muted-foreground">
                          {subtitle.toLowerCase()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void remove(b.id)}
                      aria-label="Remove bookmark"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
