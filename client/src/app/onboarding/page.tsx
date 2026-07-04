'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Wallet,
  Clock,
  Target,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/shared/states';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}
interface Interest {
  id: string;
  name: string;
  slug: string;
}

type ExperienceLevel = 'NONE' | 'BEGINNER' | 'INTERMEDIATE' | 'EXPERIENCED';
type PreferredType = 'HOME' | 'ONLINE' | 'OFFLINE' | 'HYBRID';

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; hint: string }[] = [
  { value: 'NONE', label: 'None', hint: 'Just getting started' },
  { value: 'BEGINNER', label: 'Beginner', hint: 'Some exposure' },
  { value: 'INTERMEDIATE', label: 'Intermediate', hint: 'Ran a side hustle' },
  { value: 'EXPERIENCED', label: 'Experienced', hint: 'Built a business before' },
];

const TYPE_OPTIONS: { value: PreferredType; label: string; hint: string }[] = [
  { value: 'HOME', label: 'Home-based', hint: 'Run it from home' },
  { value: 'ONLINE', label: 'Online', hint: 'Fully digital' },
  { value: 'OFFLINE', label: 'Offline', hint: 'Physical / local' },
  { value: 'HYBRID', label: 'Hybrid', hint: 'A mix of both' },
];

const STEPS = ['Skills', 'Interests', 'Your Plan'] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = React.useState(0);

  // Catalog data
  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [interests, setInterests] = React.useState<Interest[]>([]);
  const [catalogLoading, setCatalogLoading] = React.useState(true);

  // Selections
  const [skillIds, setSkillIds] = React.useState<Set<string>>(new Set());
  const [interestIds, setInterestIds] = React.useState<Set<string>>(new Set());
  const [budget, setBudget] = React.useState('');
  const [experienceLevel, setExperienceLevel] = React.useState<ExperienceLevel | ''>('');
  const [availableHours, setAvailableHours] = React.useState('');
  const [preferredType, setPreferredType] = React.useState<PreferredType | ''>('');
  const [businessGoal, setBusinessGoal] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      api.get<{ items: Skill[] }>('/users/skills', { auth: false }),
      api.get<{ items: Interest[] }>('/users/interests', { auth: false }),
    ])
      .then(([sRes, iRes]) => {
        if (!active) return;
        setSkills(sRes.data.items);
        setInterests(iRes.data.items);
      })
      .catch((err) => toast.error(err?.message ?? 'Failed to load onboarding options'))
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function toggle(set: Set<string>, id: string): Set<string> {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = {
        skillIds: Array.from(skillIds),
        interestIds: Array.from(interestIds),
        budget: budget.trim() !== '' ? Number(budget) : undefined,
        experienceLevel: experienceLevel || undefined,
        availableHours: availableHours.trim() !== '' ? Number(availableHours) : undefined,
        preferredType: preferredType || undefined,
        businessGoal: businessGoal.trim() !== '' ? businessGoal.trim() : undefined,
      };

      const res = await api.put<{ readinessScore: number; profileCompletion: number }>(
        '/users/me/assessment',
        payload,
      );

      useAuthStore.getState().updateUser({
        readinessScore: res.data.readinessScore,
        profileCompletion: res.data.profileCompletion,
      });

      toast.success('Assessment saved — here are your best-fit business ideas.');
      router.push('/dashboard/recommendations');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(message);
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const canNext =
    step === 0 ? skillIds.size > 0 : step === 1 ? interestIds.size > 0 : true;

  return (
    <div className="flex min-h-screen flex-col bg-hero-grid [background-size:22px_22px]">
      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-2xl">
          {/* Logo header */}
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <span className="tile flex h-10 w-10 items-center justify-center gradient-warm">
              <Flame className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold">SkillForge</span>
          </Link>

          {/* Progress indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors',
                      i < step
                        ? 'gradient-warm text-white shadow-md shadow-primary/30'
                        : i === step
                          ? 'bg-primary/15 text-primary ring-2 ring-primary'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      'hidden text-sm font-medium sm:inline',
                      i === step ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className={cn(
                      'h-0.5 w-6 rounded-full sm:w-10',
                      i < step ? 'gradient-warm' : 'bg-muted',
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">
                {step === 0 && 'What skills do you have?'}
                {step === 1 && 'What are you interested in?'}
                {step === 2 && 'Tell us about your plan'}
              </CardTitle>
              <CardDescription>
                {step === 0 && 'Pick everything that applies — we match ideas to your strengths.'}
                {step === 1 && 'Choose the areas you would enjoy building a business around.'}
                {step === 2 && 'A few final details to fine-tune your recommendations.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {catalogLoading && step !== 2 ? (
                <Spinner />
              ) : (
                <>
                  {/* Step 0 — Skills */}
                  {step === 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => {
                        const active = skillIds.has(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSkillIds((prev) => toggle(prev, s.id))}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                              active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5',
                            )}
                          >
                            {active && <Check className="h-3.5 w-3.5" />}
                            {s.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Step 1 — Interests */}
                  {step === 1 && (
                    <div className="flex flex-wrap gap-2">
                      {interests.map((it) => {
                        const active = interestIds.has(it.id);
                        return (
                          <button
                            key={it.id}
                            type="button"
                            onClick={() => setInterestIds((prev) => toggle(prev, it.id))}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                              active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5',
                            )}
                          >
                            {active && <Check className="h-3.5 w-3.5" />}
                            {it.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Step 2 — Plan details */}
                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Budget */}
                      <div className="space-y-2">
                        <Label htmlFor="budget" className="flex items-center gap-1.5">
                          <Wallet className="h-4 w-4 text-primary" /> Starting budget (₹)
                        </Label>
                        <Input
                          id="budget"
                          type="number"
                          min={0}
                          inputMode="numeric"
                          placeholder="e.g. 25000"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                        />
                      </div>

                      {/* Experience level */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-primary" /> Experience level
                        </Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {EXPERIENCE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setExperienceLevel(opt.value)}
                              className={cn(
                                'rounded-xl border p-3 text-left transition-colors',
                                experienceLevel === opt.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50',
                              )}
                            >
                              <p className="text-sm font-semibold">{opt.label}</p>
                              <p className="text-xs text-muted-foreground">{opt.hint}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Available hours */}
                      <div className="space-y-2">
                        <Label htmlFor="hours" className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-primary" /> Hours you can commit / week
                        </Label>
                        <Input
                          id="hours"
                          type="number"
                          min={0}
                          max={168}
                          inputMode="numeric"
                          placeholder="e.g. 15"
                          value={availableHours}
                          onChange={(e) => setAvailableHours(e.target.value)}
                        />
                      </div>

                      {/* Preferred type */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-primary" /> Preferred business type
                        </Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {TYPE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setPreferredType(opt.value)}
                              className={cn(
                                'rounded-xl border p-3 text-left transition-colors',
                                preferredType === opt.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50',
                              )}
                            >
                              <p className="text-sm font-semibold">{opt.label}</p>
                              <p className="text-xs text-muted-foreground">{opt.hint}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Business goal */}
                      <div className="space-y-2">
                        <Label htmlFor="goal" className="flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-primary" /> What is your business goal?
                        </Label>
                        <Textarea
                          id="goal"
                          rows={3}
                          maxLength={500}
                          placeholder="e.g. Build a ₹50k/month home bakery within 6 months."
                          value={businessGoal}
                          onChange={(e) => setBusinessGoal(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0 || submitting}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Get my recommendations
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {step < STEPS.length - 1 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {step === 0
                ? `${skillIds.size} skill${skillIds.size === 1 ? '' : 's'} selected`
                : `${interestIds.size} interest${interestIds.size === 1 ? '' : 's'} selected`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
