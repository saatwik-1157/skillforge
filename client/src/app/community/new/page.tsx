'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared/states';

interface CreatePostData {
  post: { slug: string };
}

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10),
    ),
  );
}

export default function NewPostPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [isStory, setIsStory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const tags = parseTags(tagsRaw);
  const titleOk = title.trim().length >= 4 && title.trim().length <= 160;
  const bodyOk = body.trim().length >= 1;
  const canSubmit = titleOk && bodyOk && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await api.post<CreatePostData>('/community/posts', {
        title: title.trim(),
        body: body.trim(),
        tags,
        isStory,
      });
      toast.success('Post created');
      router.push(`/community/${res.data.post.slug}`);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Could not create post');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="container-page py-12">
          <div className="mx-auto max-w-2xl">
            <Link
              href="/community"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to community
            </Link>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Create a post
            </h1>
            <p className="mt-1 text-muted-foreground">
              Ask a question, share a lesson, or tell your founder story.
            </p>

            {!isAuthenticated ? (
              <div className="mt-10">
                <Spinner />
              </div>
            ) : (
              <Card className="mt-8 rounded-2xl">
                <CardContent className="p-6">
                  <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="A clear, specific headline"
                        maxLength={160}
                      />
                      <p className="text-xs text-muted-foreground">
                        {title.trim().length < 4
                          ? 'At least 4 characters.'
                          : `${title.trim().length}/160`}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="body">Body</Label>
                      <Textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your post… Markdown-style line breaks are preserved."
                        rows={10}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={tagsRaw}
                        onChange={(e) => setTagsRaw(e.target.value)}
                        placeholder="funding, marketing, hiring"
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated, up to 10 tags.
                      </p>
                      {tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="muted">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
                      <input
                        type="checkbox"
                        checked={isStory}
                        onChange={(e) => setIsStory(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span>
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Mark as a Story
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          Stories are personal founder journeys and get highlighted in the feed.
                        </span>
                      </span>
                    </label>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" asChild>
                        <Link href="/community">Cancel</Link>
                      </Button>
                      <Button type="submit" disabled={!canSubmit}>
                        <Send className="mr-2 h-4 w-4" />
                        {submitting ? 'Publishing…' : 'Publish post'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
