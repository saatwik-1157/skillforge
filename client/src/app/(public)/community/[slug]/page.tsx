'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  MessageSquare,
  Eye,
  Sparkles,
  ArrowLeft,
  Send,
  CornerDownRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiClientError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Spinner, EmptyState } from '@/components/shared/states';

interface Author {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface CommentNode {
  id: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  author: Author;
  replies: CommentNode[];
}

interface PostDetail {
  id: string;
  slug: string;
  title: string;
  body: string;
  tags: string[];
  isStory: boolean;
  viewCount: number;
  createdAt: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  comments: CommentNode[];
}

interface PostDetailData {
  post: PostDetail;
}

interface LikeData {
  liked: boolean;
  count: number;
}

interface CommentData {
  comment: {
    id: string;
    body: string;
    parentId: string | null;
    createdAt: string;
    author: Author;
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PostDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const user = useAuthStore((s) => s.user);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [liking, setLiking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PostDetailData>(`/community/posts/${slug}`, { auth: false });
      setPost(res.data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLike() {
    if (!post) return;
    if (!user) {
      toast.error('Please log in to like posts.');
      return;
    }
    setLiking(true);
    try {
      const res = await api.post<LikeData>(`/community/posts/${post.id}/like`);
      setPost((p) =>
        p ? { ...p, liked: res.data.liked, likeCount: res.data.count } : p,
      );
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Could not update like');
    } finally {
      setLiking(false);
    }
  }

  // Insert a newly created comment into the tree (top-level or as a reply).
  const addCommentToTree = useCallback(
    (created: CommentData['comment']) => {
      setPost((p) => {
        if (!p) return p;
        const node: CommentNode = { ...created, replies: [] };
        if (!created.parentId) {
          return {
            ...p,
            commentCount: p.commentCount + 1,
            comments: [...p.comments, node],
          };
        }
        const comments = p.comments.map((c) =>
          c.id === created.parentId ? { ...c, replies: [...c.replies, node] } : c,
        );
        return { ...p, commentCount: p.commentCount + 1, comments };
      });
    },
    [],
  );

  if (loading) return <div className="container-page py-12"><Spinner /></div>;

  if (error || !post) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={MessageSquare}
          title="Post not found"
          description={error ?? 'This post may have been removed.'}
          actionLabel="Back to community"
          actionHref="/community"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/community"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to community
        </Link>

        {/* Post */}
        <article>
          <div className="flex items-center gap-3">
            <Avatar src={post.author.avatarUrl ?? undefined} name={post.author.name} />
            <div>
              <p className="text-sm font-medium">{post.author.name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
            </div>
            {post.isStory && (
              <Badge variant="success" className="ml-auto">
                <Sparkles className="mr-1 h-3 w-3" />
                Story
              </Badge>
            )}
          </div>

          <h1 className="mt-6 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/community?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="muted" className="hover:bg-primary/10">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
            {post.body}
          </div>

          <div className="mt-8 flex items-center gap-4 border-y border-border py-4">
            <Button
              variant={post.liked ? 'default' : 'outline'}
              size="sm"
              onClick={handleLike}
              disabled={liking}
            >
              <Heart
                className={cn('mr-2 h-4 w-4', post.liked && 'fill-current')}
              />
              {post.likeCount}
            </Button>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {post.commentCount}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {post.viewCount}
            </span>
          </div>
        </article>

        {/* Comments */}
        <section className="mt-8">
          <h2 className="text-lg font-bold">
            {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
          </h2>

          {/* Top-level composer */}
          <div className="mt-4">
            <CommentComposer
              postId={post.id}
              canPost={!!user}
              onCreated={addCommentToTree}
              placeholder="Share your thoughts…"
            />
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {post.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to reply.
              </p>
            ) : (
              post.comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  canPost={!!user}
                  onCreated={addCommentToTree}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function CommentThread({
  comment,
  postId,
  canPost,
  onCreated,
}: {
  comment: CommentNode;
  postId: string;
  canPost: boolean;
  onCreated: (c: CommentData['comment']) => void;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div>
      <CommentBody comment={comment} />
      <div className="ml-11 mt-1.5">
        <button
          type="button"
          onClick={() => {
            if (!canPost) {
              toast.error('Please log in to reply.');
              return;
            }
            setReplying((r) => !r);
          }}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Reply
        </button>

        {replying && (
          <div className="mt-3">
            <CommentComposer
              postId={postId}
              parentId={comment.id}
              canPost={canPost}
              placeholder={`Reply to ${comment.author.name}…`}
              onCreated={(c) => {
                onCreated(c);
                setReplying(false);
              }}
              compact
            />
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 border-l-2 border-border pl-4">
            {comment.replies.map((reply) => (
              <CommentBody key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentBody({ comment, isReply }: { comment: CommentNode; isReply?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0">
        {isReply && (
          <CornerDownRight className="mb-1 hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        )}
        <Avatar src={comment.author.avatarUrl ?? undefined} name={comment.author.name} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">{comment.body}</p>
      </div>
    </div>
  );
}

function CommentComposer({
  postId,
  parentId,
  canPost,
  placeholder,
  onCreated,
  compact,
}: {
  postId: string;
  parentId?: string;
  canPost: boolean;
  placeholder?: string;
  onCreated: (c: CommentData['comment']) => void;
  compact?: boolean;
}) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!canPost) {
    return (
      <Card className="rounded-2xl border-dashed">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-muted-foreground">
            Log in to join the conversation.
          </p>
          <Button size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await api.post<CommentData>(`/community/posts/${postId}/comments`, {
        body: trimmed,
        ...(parentId ? { parentId } : {}),
      });
      onCreated(res.data.comment);
      setBody('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Could not post comment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={5000}
      />
      <div className="mt-2 flex justify-end">
        <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
          <Send className="mr-2 h-4 w-4" />
          {parentId ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </form>
  );
}
