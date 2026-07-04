'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileStack,
  MessageSquareWarning,
  Megaphone,
  LogOut,
  Flame,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/layout/theme-toggle';

const nav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Mentors', href: '/admin/mentors', icon: ShieldCheck },
  { label: 'Content', href: '/admin/content', icon: FileStack },
  { label: 'Complaints', href: '/admin/complaints', icon: MessageSquareWarning },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth({ roles: ['ADMIN'] });
  const pathname = usePathname();
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  async function logout() {
    await api.post('/auth/logout', undefined, { auth: false }).catch(() => {});
    clear();
    router.push('/login');
  }

  // Guard redirects; avoid flashing admin content to non-admins.
  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

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

        <div className="px-6 pb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-2.5 py-1 text-xs font-semibold text-navy">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Console
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
        </nav>

        <div className="space-y-1 border-t border-border p-3">
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Link>
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
          <div className="flex items-center gap-3">
            {/* Mobile nav */}
            <nav className="flex items-center gap-1 overflow-x-auto lg:hidden">
              {nav.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary',
                    )}
                    aria-label={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </nav>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Signed in as <span className="font-semibold text-foreground">{user?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
