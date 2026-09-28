'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, Briefcase, Languages as LanguagesIcon, CalendarPlus, Users2, MessageSquare } from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { formatINR } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Spinner, EmptyState } from '@/components/shared/states';

interface UserCard {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  author: UserCard;
}

interface MentorDetail {
  id: string;
  headline: string;
  expertise: string[];
  languages: string[];
  yearsExperience: number;
  hourlyRate: number;
  ratingAvg: number;
  ratingCount: number;
  user: UserCard;
  reviews: Review[];
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= Math.round(value)
              ? 'h-4 w-4 fill-primary text-primary'
              : 'h-4 w-4 text-muted-foreground/40'
          }
        />
      ))}
    </span>
  );
}

export default function MentorDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [mentor, setMentor] = React.useState<MentorDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);

    api
      .get<{ mentor: MentorDetail }>(`/mentors/${id}`, { auth: false })
      .then((res) => {
        if (active) setMentor(res.data.mentor);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Failed to load mentor');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-12">
        <Spinner />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={Users2}
          title="Mentor not found"
          description={error ?? 'This mentor profile is no longer available.'}
          actionLabel="Browse mentors"
          actionHref="/mentors"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          {/* Header */}
          <Card>
            <CardHeader className="flex-row items-start gap-5 space-y-0">
              <Avatar
                src={mentor.user.avatarUrl ?? undefined}
                name={mentor.user.name}
                className="h-16 w-16 text-lg"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-extrabold tracking-tight">{mentor.user.name}</h1>
                <p className="mt-1 text-muted-foreground">{mentor.headline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Stars value={mentor.ratingAvg} />
                    {mentor.ratingCount > 0 ? (
                      <span className="text-muted-foreground">
                        {mentor.ratingAvg.toFixed(1)} ({mentor.ratingCount})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No reviews yet</span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    {mentor.yearsExperience} yr{mentor.yearsExperience === 1 ? '' : 's'} experience
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Expertise</h3>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.expertise.map((tag) => (
                    <Badge key={tag} variant="muted">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {mentor.languages.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Languages</h3>
                  <div className="flex items-center gap-1.5 text-sm">
                    <LanguagesIcon className="h-4 w-4 text-muted-foreground" />
                    {mentor.languages.join(', ')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <div>
            <h2 className="mb-4 text-lg font-bold">
              Reviews {mentor.ratingCount > 0 && `(${mentor.ratingCount})`}
            </h2>
            {mentor.reviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No reviews yet"
                description="Be the first to book a session and share your experience."
              />
            ) : (
              <div className="space-y-4">
                {mentor.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={review.author.avatarUrl ?? undefined}
                          name={review.author.name}
                          className="h-8 w-8 text-xs"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{review.author.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <Stars value={review.rating} />
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <BookingCard mentor={mentor} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ mentor }: { mentor: MentorDetail }) {
  const user = useAuthStore((s) => s.user);

  const [scheduledAt, setScheduledAt] = React.useState('');
  const [durationMin, setDurationMin] = React.useState('30');
  const [topic, setTopic] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error('Please pick a date and time.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/mentors/${mentor.id}/book`, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMin: Number(durationMin),
        ...(topic.trim() ? { topic: topic.trim() } : {}),
      });
      toast.success('Session requested! The mentor will confirm shortly.');
      setScheduledAt('');
      setTopic('');
      setDurationMin('30');
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Could not request the session.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Book a session</span>
          <span className="text-primary">
            {mentor.hourlyRate > 0 ? `${formatINR(mentor.hourlyRate)}/hr` : 'Free'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in to request a mentoring session.
            </p>
            <Button className="w-full" asChild>
              <Link href="/login">Log in to book</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBook} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Date &amp; time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="durationMin">Duration</Label>
              <select
                id="durationMin"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic (optional)</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What would you like to discuss?"
                maxLength={200}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              <CalendarPlus className="h-4 w-4" />
              {submitting ? 'Requesting…' : 'Request session'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
