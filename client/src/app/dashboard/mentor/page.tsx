'use client';

import * as React from 'react';
import { Users2, CalendarClock, Star, CheckCircle2, Loader2 } from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { PageHeader, Spinner, EmptyState } from '@/components/shared/states';

type SessionStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface UserCard {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface Session {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: SessionStatus;
  topic?: string | null;
  entrepreneur: UserCard;
}

interface DashboardData {
  totalStudents: number;
  sessionsByStatus: Partial<Record<SessionStatus, number>>;
  ratingAvg: number;
  ratingCount: number;
  upcomingSessions: Session[];
}

interface MySessions {
  asEntrepreneur: Session[];
  asMentor: Session[];
}

const STATUS_VARIANT: Record<SessionStatus, 'default' | 'navy' | 'success' | 'muted' | 'outline'> = {
  REQUESTED: 'navy',
  CONFIRMED: 'default',
  COMPLETED: 'success',
  CANCELLED: 'muted',
};

// Allowed mentor transitions per the backend service.
const ACTIONS: Record<SessionStatus, { label: string; next: SessionStatus }[]> = {
  REQUESTED: [
    { label: 'Confirm', next: 'CONFIRMED' },
    { label: 'Cancel', next: 'CANCELLED' },
  ],
  CONFIRMED: [
    { label: 'Complete', next: 'COMPLETED' },
    { label: 'Cancel', next: 'CANCELLED' },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MentorDashboardPage() {
  useAuth({ roles: ['MENTOR'] });

  const [dashboard, setDashboard] = React.useState<DashboardData | null>(null);
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get<DashboardData>('/mentors/me/dashboard'),
      api.get<MySessions>('/mentors/me/sessions'),
    ])
      .then(([dash, sess]) => {
        if (!active) return;
        setDashboard(dash.data);
        setSessions(sess.data.asMentor);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Failed to load your dashboard');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  async function updateStatus(sessionId: string, next: SessionStatus) {
    setBusyId(sessionId);
    try {
      const res = await api.patch<Session>(`/mentors/sessions/${sessionId}/status`, {
        status: next,
      });
      const updated = res.data;
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: updated.status } : s)),
      );
      toast.success(`Session marked ${next.toLowerCase()}.`);
      // Refresh dashboard stats which depend on status counts.
      api
        .get<DashboardData>('/mentors/me/dashboard')
        .then((d) => setDashboard(d.data))
        .catch(() => {});
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Could not update the session.';
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Mentor dashboard" description="Manage your sessions and students." />
        <Spinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Mentor dashboard" description="Manage your sessions and students." />
        <EmptyState
          icon={Users2}
          title="Couldn't load your dashboard"
          description={error}
        />
      </>
    );
  }

  const byStatus = dashboard?.sessionsByStatus ?? {};
  const activeCount = (byStatus.REQUESTED ?? 0) + (byStatus.CONFIRMED ?? 0);

  return (
    <>
      <PageHeader title="Mentor dashboard" description="Manage your sessions and students." />

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users2}
          label="Students"
          value={dashboard?.totalStudents ?? 0}
        />
        <StatCard
          icon={CalendarClock}
          label="Active sessions"
          value={activeCount}
          hint={`${byStatus.REQUESTED ?? 0} requested · ${byStatus.CONFIRMED ?? 0} confirmed`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={byStatus.COMPLETED ?? 0}
        />
        <StatCard
          icon={Star}
          label="Rating"
          value={
            dashboard && dashboard.ratingCount > 0 ? dashboard.ratingAvg.toFixed(1) : '—'
          }
          hint={
            dashboard && dashboard.ratingCount > 0
              ? `${dashboard.ratingCount} review${dashboard.ratingCount === 1 ? '' : 's'}`
              : 'No reviews yet'
          }
        />
      </div>

      {/* Sessions table */}
      <Card>
        <CardHeader>
          <CardTitle>Your sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No sessions yet"
              description="When entrepreneurs book time with you, their requests will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">When</th>
                    <th className="pb-3 font-medium">Topic</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => {
                    const actions = ACTIONS[session.status];
                    const busy = busyId === session.id;
                    return (
                      <tr key={session.id} className="border-b border-border last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={session.entrepreneur.avatarUrl ?? undefined}
                              name={session.entrepreneur.name}
                              className="h-8 w-8 text-xs"
                            />
                            <span className="font-medium">{session.entrepreneur.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          <div>{formatWhen(session.scheduledAt)}</div>
                          <div className="text-xs">{session.durationMin} min</div>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {session.topic || <span className="italic">No topic</span>}
                        </td>
                        <td className="py-4">
                          <Badge variant={STATUS_VARIANT[session.status]}>
                            {session.status.charAt(0) + session.status.slice(1).toLowerCase()}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            {actions.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              actions.map((action) => (
                                <Button
                                  key={action.next}
                                  size="sm"
                                  variant={action.next === 'CANCELLED' ? 'outline' : 'default'}
                                  disabled={busy}
                                  onClick={() => updateStatus(session.id, action.next)}
                                >
                                  {busy && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  )}
                                  {action.label}
                                </Button>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-orange-700 dark:text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-extrabold leading-none">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
