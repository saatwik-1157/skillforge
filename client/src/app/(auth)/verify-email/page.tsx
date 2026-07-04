'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

/**
 * Email verification screen. Reached right after registration (the API emails a
 * 6-digit code). Verifies via POST /auth/verify-otp, flips the local
 * isEmailVerified flag, and continues to onboarding.
 */
export default function VerifyEmailPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Prefill the signed-in user's email once it hydrates.
  React.useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, code }, { auth: false });
      updateUser({ isEmailVerified: true });
      toast.success('Email verified! 🎉');
      router.push(user ? '/onboarding' : '/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code we emailed you to confirm your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={verify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              readOnly={Boolean(user?.email)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify email
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Verify later?</span>
          <Link
            href={user ? '/onboarding' : '/login'}
            className="font-semibold text-primary hover:underline"
          >
            Skip for now
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
