'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuthStore, type AuthUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = React.useState(false);
  const [role, setRole] = React.useState<'ENTREPRENEUR' | 'MENTOR'>('ENTREPRENEUR');
  const [form, setForm] = React.useState({ name: '', email: '', password: '' });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ user: AuthUser; accessToken: string }>(
        '/auth/register',
        { ...form, role },
        { auth: false },
      );
      setSession(res.data.user, res.data.accessToken);
      toast.success('Account created! Check your email for the verification code.');
      router.push('/verify-email');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start turning your skills into a business — free.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
          {(['ENTREPRENEUR', 'MENTOR'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                role === r ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              {r === 'ENTREPRENEUR' ? 'Entrepreneur' : 'Mentor'}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Priya Sharma"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="8+ chars, mixed case & a number"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-orange-700 dark:text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
