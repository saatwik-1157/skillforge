'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  GraduationCap,
  Map,
  Users,
  ChefHat,
  Camera,
  Scissors,
  Palette,
  Code,
  Sprout,
  Star,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Wallet,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/* ---------- helpers ---------- */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Badge className="mb-4">{eyebrow}</Badge>
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/* ---------- Stats ---------- */
export function Stats() {
  const stats = [
    { value: '12,400+', label: 'Entrepreneurs enabled', grad: 'gradient-warm' },
    { value: '₹4.2 Cr+', label: 'Revenue generated', grad: 'gradient-cool' },
    { value: '150+', label: 'Business blueprints', grad: 'gradient-sunset' },
    { value: '320+', label: 'Verified mentors', grad: 'bg-gradient-to-br from-violet-500 to-sky-500' },
  ];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container-page grid grid-cols-2 gap-6 py-14 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <div className="flex flex-col items-center gap-3 text-center">
              <span className={`tile h-12 w-12 ${s.grad}`}>
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="text-3xl font-extrabold sm:text-4xl">{s.value}</p>
              <p className="-mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
export function HowItWorks() {
  const steps = [
    { icon: Search, title: 'Discover', desc: 'Tell us your skills, budget and time. Get matched to businesses that fit you.', grad: 'gradient-warm' },
    { icon: GraduationCap, title: 'Learn', desc: 'Short courses on marketing, finance, GST, branding and sales — the essentials.', grad: 'gradient-cool' },
    { icon: Map, title: 'Follow a Roadmap', desc: 'A step-by-step plan from idea validation to your first paying customer.', grad: 'gradient-sunset' },
    { icon: Users, title: 'Get Mentored', desc: 'Book sessions with verified mentors who have built real businesses.', grad: 'bg-gradient-to-br from-violet-500 to-sky-500' },
  ];
  return (
    <section id="how-it-works" className="container-page py-24">
      <SectionHeading
        eyebrow="How SkillForge works"
        title="From skill to enterprise in four steps"
        subtitle="A guided operating system for first-time founders."
      />
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.1}>
            <Card className="group h-full overflow-hidden">
              <CardContent className="pt-6">
                <div className={`tile h-12 w-12 ${s.grad} transition-transform group-hover:scale-110`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-5 text-sm font-bold text-primary">Step {i + 1}</p>
                <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Categories ---------- */
export function Categories() {
  const cats = [
    { icon: ChefHat, name: 'Food & Catering', count: 28, grad: 'gradient-warm' },
    { icon: Camera, name: 'Photography', count: 14, grad: 'bg-gradient-to-br from-sky-500 to-indigo-500' },
    { icon: Scissors, name: 'Tailoring & Fashion', count: 19, grad: 'bg-gradient-to-br from-rose-500 to-pink-500' },
    { icon: Palette, name: 'Creative & Handicrafts', count: 22, grad: 'bg-gradient-to-br from-fuchsia-500 to-purple-500' },
    { icon: Code, name: 'Tech & Digital', count: 31, grad: 'gradient-cool' },
    { icon: Sprout, name: 'Agriculture', count: 12, grad: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
  ];
  return (
    <section className="bg-secondary/40 py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Popular categories" title="Find your lane" subtitle="Every skill has a business waiting to be built." />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <Link href="/businesses">
                <Card className="group cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-6">
                    <div className={`tile h-14 w-14 ${c.grad} transition-transform group-hover:scale-110`}>
                      <c.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.count} business ideas</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Featured business ideas (image cards) ---------- */
export function FeaturedIdeas() {
  const ideas = [
    { slug: 'home-catering', title: 'Home Catering', tag: 'Food', invest: '₹10k–40k', profit: '₹15k–40k/mo', diff: 'Beginner', grad: 'gradient-warm' },
    { slug: 'home-bakery', title: 'Home Bakery', tag: 'Food', invest: '₹20k–80k', profit: '₹20k–60k/mo', diff: 'Beginner', grad: 'gradient-sunset' },
    { slug: 'freelance-graphic-design', title: 'Freelance Design', tag: 'Creative', invest: '₹5k–25k', profit: '₹25k–90k/mo', diff: 'Intermediate', grad: 'bg-gradient-to-br from-fuchsia-500 to-purple-500' },
  ];
  return (
    <section className="container-page py-24">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge className="mb-4">Featured ideas</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Businesses you could start this month</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/businesses">
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {ideas.map((idea, i) => (
          <Reveal key={idea.slug} delay={i * 0.1}>
            <Link href={`/businesses/${idea.slug}`}>
              <Card className="group h-full overflow-hidden p-0">
                <div className="cover h-44 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://picsum.photos/seed/sf-${idea.slug}/640/360`}
                    alt={idea.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Badge className={`absolute left-3 top-3 z-10 border-0 text-white ${idea.grad}`}>{idea.tag}</Badge>
                </div>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{idea.title}</h3>
                    <Badge variant="muted">{idea.diff}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Wallet className="h-4 w-4" /> {idea.invest}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-500">
                      <TrendingUp className="h-4 w-4" /> {idea.profit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Mentor highlights ---------- */
export function MentorHighlights() {
  const mentors = [
    { name: 'Rahul Verma', field: 'Food & Operations', rating: '4.9', sessions: 210, langs: 'EN · HI · KN' },
    { name: 'Sneha Iyer', field: 'Digital Marketing', rating: '5.0', sessions: 168, langs: 'EN · HI · TA' },
    { name: 'Arjun Mehta', field: 'Finance & GST', rating: '4.8', sessions: 142, langs: 'EN · HI' },
    { name: 'Fatima Khan', field: 'Branding & Design', rating: '4.9', sessions: 189, langs: 'EN · UR · HI' },
  ];
  return (
    <section className="bg-secondary/40 py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Meet your mentors" title="Learn from people who've done it" subtitle="Every mentor is verified before they can accept a session." />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <Card className="h-full text-center">
                <CardContent className="flex flex-col items-center pt-8">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}&radius=50&backgroundColor=ffd5dc,d1d4f9,c0aede,b6e3f4,ffdfbf`}
                      alt={m.name}
                      className="h-20 w-20 rounded-full border-2 border-primary/20 bg-secondary"
                    />
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                      <BadgeCheck className="h-6 w-6 text-sky-500" />
                    </span>
                  </div>
                  <p className="mt-4 font-bold">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.field}</p>
                  <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary">
                    <Star className="h-4 w-4 fill-current" /> {m.rating}
                    <span className="ml-1 font-normal text-muted-foreground">· {m.sessions} sessions</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{m.langs}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild>
            <Link href="/mentors">
              Find your mentor <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
export function Testimonials() {
  const items = [
    { name: 'Priya Sharma', role: 'Home Catering, Pune', quote: 'I turned my cooking into a ₹45,000/month catering business in 3 months. The roadmap made it feel possible.' },
    { name: 'Ravi Kumar', role: 'Mobile Repair, Hyderabad', quote: 'The GST and pricing lessons alone were worth it. My first shop is now profitable.' },
    { name: 'Anjali Nair', role: 'Handmade Jewelry, Kochi', quote: 'My mentor helped me find my first 10 customers. SkillForge is like a co-founder.' },
  ];
  return (
    <section id="stories" className="container-page py-24">
      <SectionHeading eyebrow="Success stories" title="Real people. Real businesses." />
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-foreground">“{t.quote}”</p>
                <div className="mt-6 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.name)}&radius=50&backgroundColor=ffd5dc,d1d4f9,c0aede,b6e3f4,ffdfbf`}
                    alt={t.name}
                    className="h-11 w-11 rounded-full bg-secondary"
                  />
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
export function FAQ() {
  const faqs = [
    { q: 'Is SkillForge free to start?', a: 'Yes. You can create an account, take the skill assessment, get recommendations and follow roadmaps for free. Premium mentorship plans are coming soon.' },
    { q: 'Do I need business experience?', a: 'No. SkillForge is built for first-time founders. Every idea comes with a beginner-friendly roadmap and bite-size lessons.' },
    { q: 'How are business ideas matched to me?', a: 'Our recommendation engine scores each idea against your skills, budget, available time and preferred business type.' },
    { q: 'Are the mentors verified?', a: 'Every mentor is reviewed and verified by our team before they can accept sessions.' },
  ];
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section id="faq" className="bg-secondary/40 py-24">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <Card key={f.q}>
              <button
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
