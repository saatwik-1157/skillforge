'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type Role } from '@/lib/auth';

/**
 * Client-side auth guard. Redirects to /login when unauthenticated, and to
 * /dashboard when the user's role isn't permitted.
 */
export function useAuth(options?: { roles?: Role[] }) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken || !user) {
      router.replace('/login');
      return;
    }
    if (options?.roles && !options.roles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [accessToken, user, options?.roles, router]);

  return { user, isAuthenticated: Boolean(accessToken && user) };
}
