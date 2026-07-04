'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Rocket, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-grid [background-size:22px_22px]">
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-navy/10 blur-3xl" />

      <div className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <Badge className="w-fit gap-1">
            <Sparkles className="h-3 w-3" /> Startup accelerator, in your pocket
          </Badge>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Turn your <span className="gradient-text">skills</span> into a
            successful <span className="gradient-text">business</span>.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            SkillForge matches your talents and budget to real business ideas,
            teaches you everything you need, and guides you step-by-step from
            zero to your first ₹10,000 in revenue.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/businesses">Explore Business Ideas</Link>
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground">
            <div>
              <p className="text-2xl font-extrabold text-foreground">12k+</p>
              Entrepreneurs
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">150+</p>
              Business Ideas
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">4.9★</p>
              Mentor Rating
            </div>
          </div>
        </motion.div>

        {/* Animated illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative flex items-center justify-center"
        >
          <div className="relative grid w-full max-w-md grid-cols-2 gap-4">
            {[
              { icon: Target, title: 'Match', desc: 'Skills → Ideas', delay: 0 },
              { icon: Rocket, title: 'Launch', desc: 'Guided roadmap', delay: 0.4 },
              { icon: TrendingUp, title: 'Grow', desc: 'First revenue', delay: 0.8 },
              { icon: Sparkles, title: 'Learn', desc: 'Bite-size courses', delay: 1.2 },
            ].map((c) => (
              <motion.div
                key={c.title}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: c.delay }}
                className="rounded-2xl border border-border bg-card p-6 shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-bold">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
