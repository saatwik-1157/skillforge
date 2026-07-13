'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Lightbulb,
  Map,
  GraduationCap,
  Users,
  Award,
  Bell,
  Settings,
  LogOut,
  Flame,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { ThemeToggle } from './theme-toggle';

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Business Ideas', href: '/businesses', icon: Lightbulb },
  { label: 'My Roadmaps', href: '/dashboard/roadmaps', icon: Map },
  { label: 'Learning', href: '/dashboard/learning', icon: GraduationCap },
  { label: 'Mentors', href: '/mentors', icon: Users },
  { label: 'Achievements', href: '/dashboard/achievements', icon: Award },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useAuthStore();

  async function logout() {
    await api.post('/auth/logout', undefined, { auth: false }).catch(() => {});
    clear();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <Link href="/" className="flex h-16 items-center gap-2 px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Flame className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold">SkillForge</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.name ?? 'Founder'}</span>
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              {user?.name?.charAt(0) ?? 'U'}
            </div>
          </div>
        </header>
        <main id="main-content" className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
