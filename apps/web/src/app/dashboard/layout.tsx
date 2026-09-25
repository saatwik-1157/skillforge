'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null; // guard redirects; avoid flash
  return <DashboardShell>{children}</DashboardShell>;
}
