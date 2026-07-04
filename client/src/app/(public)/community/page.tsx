'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageSquare,
  Heart,
  Eye,
  Sparkles,
  Plus,
  TrendingUp,
  Hash,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageHeader, SkeletonCards, EmptyState } from '@/components/shared/states';

interface PostAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface PostListItem {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  isStory: boolean;
  viewCount: number;
  createdAt: string;
  author: PostAuthor;
  _count: { likes: number; comments: number };
}

interface ListPostsData {
  items: PostListItem[];
}

interface TrendingTag {
  tag: string;
  count: number;
}

interface TrendingTagsData {
  items: TrendingTag[];
}

type Sort = 'recent' | 'trending';
type StoryFilter = 'all' | 'stories';

function excerpt(body: string, max = 180): string {
  const clean = body.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<Sort>('recent');
  const [storyFilter, setStoryFilter] = useState<StoryFilter>('all');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [trending, setTrending] = useState<TrendingTag[]>([]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('sort', sort);
      if (storyFilter === 'stories') params.set('isStory', 'true');
      if (q) params.set('q', q);
      if (activeTag) params.set('tag', activeTag);
      params.set('limit', '30');

      const res = await api.get<ListPostsData>(`/community/posts?${params.toString()}`, {
        auth: false,
      });
      setPosts(res.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [sort, storyFilter, q, activeTag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    api
      .get<TrendingTagsData>('/community/tags/trending?limit=10', { auth: false })
      .then((res) => setTrending(res.data.items))
      .catch(() => setTrending([]));
  }, []);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQ(search.trim());
  }

  return (
    <div className="container-page py-12">
      <PageHeader
        title="Community"
        description="Ask questions, share wins, and learn from fellow founders and mentors."
      >
        <Button asChild>
          <Link href="/community/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main column */}
        <div>
          {/* Controls */}
          <div className="mb-6 flex flex-col gap-4">
            <form onSubmit={onSearchSubmit} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts…"
                className="pl-9"
              />
            </form>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sort toggle */}
              <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
                {(['recent', 'trending'] as Sort[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSort(s)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                      sort === s
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {s === 'trending' && <TrendingUp className="h-3.5 w-3.5" />}
                    {s}
                  </button>
                ))}
              </div>

              {/* Story filter toggle */}
              <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
                {(
                  [
                    ['all', 'All'],
                    ['stories', 'Stories'],
                  ] as [StoryFilter, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStoryFilter(value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      storyFilter === value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {value === 'stories' && <Sparkles className="h-3.5 w-3.5" />}
                    {label}
                  </button>
                ))}
              </div>

              {activeTag && (
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Hash className="h-3.5 w-3.5" />
                  {activeTag}
                  <span className="ml-1 text-xs">✕</span>
                </button>
              )}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <SkeletonCards count={4} />
          ) : error ? (
            <EmptyState
              icon={MessageSquare}
              title="Couldn't load the community"
              description={error}
            />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No posts yet"
              description={
                q || activeTag || storyFilter === 'stories'
                  ? 'Try adjusting your filters or search.'
                  : 'Be the first to start a conversation.'
              }
              actionLabel="New Post"
              actionHref="/community/new"
            />
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="rounded-2xl transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar src={post.author.avatarUrl ?? undefined} name={post.author.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      {post.isStory && (
                        <Badge variant="success" className="ml-auto shrink-0">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Story
                        </Badge>
                      )}
                    </div>

                    <Link href={`/community/${post.slug}`} className="group mt-4 block">
                      <h2 className="text-lg font-bold leading-snug group-hover:text-primary">
                        {post.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {excerpt(post.body)}
                      </p>
                    </Link>

                    {post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setActiveTag(tag)}
                          >
                            <Badge variant="muted" className="hover:bg-primary/10">
                              #{tag}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-5 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Heart className="h-4 w-4" />
                        {post._count.likes}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        {post._count.comments}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {post.viewCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending tags
              </h3>
              {trending.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No tags yet.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {trending.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => setActiveTag(t.tag)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                        activeTag === t.tag
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      #{t.tag}
                      <span className="text-[10px] opacity-70">{t.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
