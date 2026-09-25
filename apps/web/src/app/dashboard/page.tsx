'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bookmark,
  GraduationCap,
  Map,
  Award,
  Gauge,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

interface DashboardData {
  profileCompletion: number;
  readinessScore: number;
  counts: {
    bookmarks: number;
    enrollments: { inProgress: number; completed: number };
    certificates: number;
    achievements: number;
  };
  userRoadmaps: { id: string; roadmapId: string; title: string; progress: number; businessId?: string }[];
  upcomingSessions: { id: string; topic?: string; scheduledAt: string; mentorName?: string }[];
}

function Ring({ value, label }: { value: number; label: string }) {
  const dash = `${(value / 100) * 264} 264`;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" className="fill-none stroke-muted" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            className="fill-none stroke-primary transition-all"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={dash}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold">
          {value}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api
      .get<DashboardData>('/users/me/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Saved Ideas', value: data?.counts.bookmarks ?? 0, icon: Bookmark, href: '/dashboard/bookmarks', grad: 'gradient-warm' },
    { label: 'Courses In Progress', value: data?.counts.enrollments.inProgress ?? 0, icon: GraduationCap, href: '/dashboard/learning', grad: 'gradient-cool' },
    { label: 'Certificates', value: data?.counts.certificates ?? 0, icon: Award, href: '/dashboard/certificates', grad: 'gradient-sunset' },
    { label: 'Achievements', value: data?.counts.achievements ?? 0, icon: TrendingUp, href: '/dashboard/achievements', grad: 'bg-gradient-to-br from-violet-500 to-sky-500' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Your Business Cockpit</h1>
        <p className="text-muted-foreground">Track your journey from skill to enterprise.</p>
      </div>

      {/* Scores */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4 text-primary" /> Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around">
            {loading ? (
              <div className="skeleton h-28 w-28 rounded-full" />
            ) : (
              <>
                <Ring value={data?.readinessScore ?? user?.readinessScore ?? 0} label="Business" />
                <Ring value={data?.profileCompletion ?? user?.profileCompletion ?? 0} label="Profile" />
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="h-full transition-transform hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-4 py-6">
                  <div className={`tile h-12 w-12 ${s.grad}`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold">{loading ? '—' : s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Roadmaps */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-4 w-4 text-primary" /> Active Roadmaps
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/roadmaps">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="skeleton h-16 w-full" />
          ) : data?.userRoadmaps?.length ? (
            data.userRoadmaps.map((r) => (
              <div key={r.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.title}</span>
                  <Badge variant="muted">{r.progress}%</Badge>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${r.progress}%` }} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No roadmaps yet.</p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/businesses">Find a business idea</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
