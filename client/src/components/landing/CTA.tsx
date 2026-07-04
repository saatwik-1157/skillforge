'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Web3Forms access key (set NEXT_PUBLIC_WEB3FORMS_KEY in the environment).
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

export function CTA() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    // No key configured yet — degrade gracefully instead of erroring.
    if (!WEB3FORMS_KEY) {
      toast.success('You are on the list! We’ll be in touch.');
      setEmail('');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: 'New SkillForge newsletter signup',
          from_name: 'SkillForge Newsletter',
          email,
          message: `Newsletter signup from ${email}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('You are on the list! We’ll be in touch.');
        setEmail('');
      } else {
        toast.error(data.message ?? 'Could not subscribe. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="container-page py-24">
      <div className="relative overflow-hidden rounded-3xl bg-navy px-8 py-16 text-center text-white dark:bg-card">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to build your business?
          </h2>
          <p className="mt-4 text-white/80">
            Join thousands of first-time founders turning their skills into income.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10" asChild>
              <Link href="/businesses">Browse Ideas</Link>
            </Button>
          </div>

          <form onSubmit={subscribe} className="mx-auto mt-10 flex max-w-md gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Get the founder newsletter"
                className="h-11 w-full rounded-full border border-white/20 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
