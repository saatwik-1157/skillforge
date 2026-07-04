/**
 * Client auth store (zustand). Persists the access token + user in localStorage
 * so a refresh keeps the user signed in. The refresh token lives in an httpOnly
 * cookie managed by the API.
 */
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'VISITOR' | 'ENTREPRENEUR' | 'MENTOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  readinessScore: number;
  profileCompletion: number;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setSession: (user, accessToken) => set({ user, accessToken }),
      updateUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      clear: () => set({ user: null, accessToken: null }),
    }),
    { name: 'skillforge-auth' },
  ),
);
