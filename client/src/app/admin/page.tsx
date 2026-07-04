'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Lightbulb,
  GraduationCap,
  ShieldCheck,
  CalendarClock,
  MessagesSquare,
  MessageSquareWarning,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Spinner, PageHeader } from '@/components/shared/states';
import { cn } from '@/lib/utils';

type Role = 'VISITOR' | 'ENTREPRENEUR' | 'MENTOR' | 'ADMIN';

interface Overview {
  users: { total: number; byRole: Record<Role, number> };
  businesses: number;
  resources: number;
  mentors: {
    total: number;
    byVerificationStatus: { PENDING: number; VERIFIED: number; REJECTED: number };
  };
  sessions: number;
  forumPosts: number;
  openComplaints: number;
  recentSignups: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl: string | null;
    createdAt: string;
  }[];
}

const roleBadge: Record<Role, 'default' | 'navy' | 'success' | 'muted'> = {
  ADMIN: 'navy',
  MENTOR: 'success',
  ENTREPRENEUR: 'default',
  VISITOR: 'muted',
};

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            accent ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground',
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold leading-none">{value}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<Overview>('/admin/overview');
        if (active) setData(res.data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load overview');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHeader title="Overview" description="Platform health and activity at a glance." />

      {loading ? (
        <Spinner />
      ) : error ? (
        <Card className="rounded-2xl border-destructive/40">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {error}
          </CardContent>
        </Card>
      ) : data ? (
        <div className="space-y-8">
          {/* Primary KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={Users} label="Total users" value={data.users.total} accent />
            <Kpi icon={Lightbulb} label="Business ideas" value={data.businesses} />
            <Kpi icon={GraduationCap} label="Learning resources" value={data.resources} />
            <Kpi icon={ShieldCheck} label="Mentors" value={data.mentors.total} />
            <Kpi icon={CalendarClock} label="Mentor sessions" value={data.sessions} />
            <Kpi icon={MessagesSquare} label="Forum posts" value={data.forumPosts} />
            <Kpi
              icon={MessageSquareWarning}
              label="Open complaints"
              value={data.openComplaints}
              accent={data.openComplaints > 0}
            />
            <Kpi
              icon={ShieldCheck}
              label="Mentors pending review"
              value={data.mentors.byVerificationStatus.PENDING}
              accent={data.mentors.byVerificationStatus.PENDING > 0}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Users by role */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Users by role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.keys(data.users.byRole) as Role[]).map((role) => (
                  <div key={role} className="flex items-center justify-between">
                    <Badge variant={roleBadge[role]}>{role}</Badge>
                    <span className="text-sm font-semibold">{data.users.byRole[role]}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mentors by status */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base">Mentors by status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(
                  [
                    ['VERIFIED', 'success'],
                    ['PENDING', 'default'],
                    ['REJECTED', 'muted'],
                  ] as const
                ).map(([status, variant]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge variant={variant}>{status}</Badge>
                    <span className="text-sm font-semibold">
                      {data.mentors.byVerificationStatus[status]}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent signups */}
            <Card className="rounded-2xl lg:row-span-1">
              <CardHeader>
                <CardTitle className="text-base">Recent signups</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentSignups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent signups.</p>
                ) : (
                  <ul className="space-y-4">
                    {data.recentSignups.map((u) => (
                      <li key={u.id} className="flex items-center gap-3">
                        <Avatar src={u.avatarUrl ?? undefined} name={u.name} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <Badge variant={roleBadge[u.role]}>{u.role}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
