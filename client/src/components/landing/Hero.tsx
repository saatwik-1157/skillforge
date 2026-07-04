'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, TrendingUp, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative overflow-hidden mesh-bg">
      {/* Decorative color blobs */}
      <div className="pointer-events-none absolute -top-28 right-10 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="container-page grid items-center gap-14 py-20 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <Badge className="w-fit gap-1.5 bg-gradient-to-r from-primary/15 to-violet-500/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Your startup accelerator, in your pocket
          </Badge>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Turn your <span className="gradient-text">skills</span> into a
            <br className="hidden sm:block" /> thriving{' '}
            <span className="gradient-text-cool">business</span>.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            SkillForge matches your talents and budget to real business ideas,
            teaches you the essentials, and guides you step-by-step from zero to
            your first ₹10,000 in revenue.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/businesses">Explore 150+ Ideas</Link>
            </Button>
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex -space-x-3">
              {['Aarav', 'Meera', 'Zoya', 'Kabir', 'Nisha'].map((n) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={n}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${n}&radius=50&backgroundColor=ffd5dc,d1d4f9,c0aede,b6e3f4,ffdfbf`}
                  alt={n}
                  className="h-10 w-10 rounded-full border-2 border-background bg-secondary"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Loved by <span className="font-semibold text-foreground">12,400+</span> first-time founders
              </p>
            </div>
          </div>
        </motion.div>

        {/* Visual collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Tall image card */}
            <div className="cover row-span-2 overflow-hidden rounded-3xl border border-border shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://picsum.photos/seed/sf-home-catering/500/720"
                alt="Home catering business"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 z-10 text-white">
                <p className="text-xs font-medium opacity-80">Trending idea</p>
                <p className="text-lg font-bold">Home Catering</p>
              </div>
            </div>

            {/* Match score card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="rounded-3xl border border-border bg-card p-5 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="tile h-10 w-10 gradient-warm">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <span className="text-2xl font-extrabold text-emerald-500">94%</span>
              </div>
              <p className="mt-3 text-sm font-semibold">Skill match</p>
              <p className="text-xs text-muted-foreground">Cooking · Baking · Marketing</p>
            </motion.div>

            {/* Investment card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.8 }}
              className="rounded-3xl border border-border bg-card p-5 shadow-xl"
            >
              <span className="tile h-10 w-10 gradient-cool">
                <Wallet className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold">₹10k – ₹40k</p>
              <p className="text-xs text-muted-foreground">to launch</p>
            </motion.div>
          </div>

          {/* Floating mentor chip */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl"
          >
            <span className="tile h-9 w-9 bg-gradient-to-br from-violet-500 to-sky-500">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold leading-none">320+ mentors</p>
              <p className="text-xs text-muted-foreground">ready to guide you</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
