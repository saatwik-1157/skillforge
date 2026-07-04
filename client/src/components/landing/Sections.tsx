'use client';

import * as React from 'react';
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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    { value: '12,400+', label: 'Entrepreneurs enabled' },
    { value: '₹4.2 Cr+', label: 'Revenue generated' },
    { value: '150+', label: 'Business blueprints' },
    { value: '320+', label: 'Verified mentors' },
  ];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container-page grid grid-cols-2 gap-8 py-12 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <div className="text-center">
              <p className="text-3xl font-extrabold gradient-text sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
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
    { icon: Search, title: 'Discover', desc: 'Tell us your skills, budget and time. Get matched to businesses that fit you.' },
    { icon: GraduationCap, title: 'Learn', desc: 'Short courses on marketing, finance, GST, branding and sales — the essentials.' },
    { icon: Map, title: 'Follow a Roadmap', desc: 'A step-by-step plan from idea validation to your first paying customer.' },
    { icon: Users, title: 'Get Mentored', desc: 'Book sessions with verified mentors who have built real businesses.' },
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
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
    { icon: ChefHat, name: 'Food & Catering', count: 28 },
    { icon: Camera, name: 'Photography', count: 14 },
    { icon: Scissors, name: 'Tailoring & Fashion', count: 19 },
    { icon: Palette, name: 'Creative & Handicrafts', count: 22 },
    { icon: Code, name: 'Tech & Digital', count: 31 },
    { icon: Sprout, name: 'Agriculture', count: 12 },
  ];
  return (
    <section className="bg-secondary/40 py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Popular categories" title="Find your lane" />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <Card className="group cursor-pointer">
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <c.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.count} business ideas</p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
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
