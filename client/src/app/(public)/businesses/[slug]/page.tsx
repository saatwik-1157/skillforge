'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Bookmark,
  Rocket,
  Clock,
  TrendingUp,
  Wallet,
  Wrench,
  Sparkles,
  Target,
  Store,
  CheckCircle2,
  Circle,
  ShieldAlert,
  Megaphone,
  Coins,
  FileText,
  BadgeCheck,
  Layers,
  Loader2,
} from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { cn, formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner, EmptyState } from '@/components/shared/states';
import { BusinessSwot } from '@/components/shared/business-swot';
import {
  BUSINESS_TYPE_LABELS,
  DIFFICULTY_LABELS,
  GROWTH_LABELS,
  type BusinessDetail,
} from '../types';

function growthVariant(g: BusinessDetail['growthPotential']) {
  return g === 'HIGH' ? 'success' : g === 'MEDIUM' ? 'default' : 'muted';
}

export default function BusinessDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [business, setBusiness] = React.useState<BusinessDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  const [bookmarking, setBookmarking] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);
  const [starting, setStarting] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    api
      .get<BusinessDetail>(`/businesses/${slug}`, { auth: false })
      .then((res) => {
        if (!cancelled) setBusiness(res.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiClientError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load this business');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleBookmark() {
    if (!business) return;
    if (!user) {
      toast.error('Please sign in to bookmark this idea.', {
        action: { label: 'Log in', onClick: () => router.push('/login') },
      });
      return;
    }
    setBookmarking(true);
    try {
      await api.post('/users/me/bookmarks', {
        target: 'BUSINESS',
        businessId: business.id,
      });
      setBookmarked(true);
      toast.success('Saved to your bookmarks.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not bookmark this idea.');
    } finally {
      setBookmarking(false);
    }
  }

  async function handleStartRoadmap() {
    if (!business?.roadmap) return;
    if (!user) {
      toast.error('Please sign in to start this roadmap.', {
        action: { label: 'Log in', onClick: () => router.push('/login') },
      });
      return;
    }
    const roadmapId = business.roadmap.id;
    setStarting(true);
    try {
      await api.post(`/roadmaps/${roadmapId}/start`);
      toast.success('Roadmap started — good luck!');
      router.push(`/dashboard/roadmaps/${roadmapId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start the roadmap.');
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="container-page py-16">
        <Spinner />
      </div>
    );
  }

  if (notFound || (!business && !error)) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={Store}
          title="Business idea not found"
          description="This idea may have been unpublished or the link is incorrect."
          actionLabel="Browse all ideas"
          actionHref="/businesses"
        />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={Store}
          title="Couldn't load this business"
          description={error ?? 'Something went wrong.'}
          actionLabel="Back to catalog"
          actionHref="/businesses"
        />
      </div>
    );
  }

  const b = business;
  const investment = b.investmentBreakdown ?? [];
  const investmentTotal = investment.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const checklist = b.checklist ?? [];
  const canvasEntries = b.businessCanvas
    ? Object.entries(b.businessCanvas).filter(([, v]) => v != null && v !== '')
    : [];

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/businesses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All business ideas
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="min-w-0">
          {/* Hero */}
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="navy">{DIFFICULTY_LABELS[b.difficulty]}</Badge>
              <Badge variant="outline">{BUSINESS_TYPE_LABELS[b.businessType]}</Badge>
              {b.category && <Badge variant="muted">{b.category.name}</Badge>}
              <Badge variant={growthVariant(b.growthPotential)}>
                <Rocket className="mr-1 h-3 w-3" />
                {GROWTH_LABELS[b.growthPotential]}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{b.title}</h1>
            {b.tagline && (
              <p className="mt-3 text-lg text-muted-foreground">{b.tagline}</p>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <div className="overflow-x-auto pb-1">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="swot">SWOT</TabsTrigger>
                <TabsTrigger value="investment">Investment</TabsTrigger>
                <TabsTrigger value="gtm">Go-To-Market</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
              </TabsList>
            </div>

            {/* Overview */}
            <TabsContent value="overview">
              <div className="space-y-8">
                <Section icon={FileText} title="About this business">
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                    {b.description}
                  </p>
                </Section>

                {b.marketDemand && (
                  <Section icon={TrendingUp} title="Market demand">
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                      {b.marketDemand}
                    </p>
                  </Section>
                )}

                {b.targetCustomers && (
                  <Section icon={Target} title="Who you'll serve">
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                      {b.targetCustomers}
                    </p>
                  </Section>
                )}

                {b.requiredSkills.length > 0 && (
                  <Section icon={Sparkles} title="Skills that help">
                    <div className="flex flex-wrap gap-2">
                      {b.requiredSkills.map((rs) => (
                        <Badge key={rs.skillId} variant="default">
                          {rs.skill.name}
                        </Badge>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            </TabsContent>

            {/* SWOT */}
            <TabsContent value="swot">
              {b.swot ? (
                <BusinessSwot swot={b.swot} />
              ) : (
                <EmptyState
                  icon={Layers}
                  title="No SWOT analysis yet"
                  description="A SWOT breakdown hasn't been published for this idea."
                />
              )}
            </TabsContent>

            {/* Investment */}
            <TabsContent value="investment">
              <div className="space-y-8">
                {investment.length > 0 ? (
                  <Section icon={Wallet} title="Investment breakdown">
                    <div className="overflow-x-auto rounded-2xl border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-secondary/50 text-left">
                            <th className="px-4 py-3 font-semibold">Item</th>
                            <th className="px-4 py-3 text-right font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {investment.map((row, i) => (
                            <tr key={i} className="border-b border-border last:border-0">
                              <td className="px-4 py-3">{row.item}</td>
                              <td className="px-4 py-3 text-right font-medium">
                                {formatINR(Number(row.amount) || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-secondary/50 font-bold">
                            <td className="px-4 py-3">Estimated total</td>
                            <td className="px-4 py-3 text-right text-primary">
                              {formatINR(investmentTotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </Section>
                ) : (
                  <Section icon={Wallet} title="Investment range">
                    <p className="text-lg font-bold">
                      {formatINR(b.minInvestment)}{' '}
                      <span className="text-muted-foreground">–</span> {formatINR(b.maxInvestment)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A detailed cost breakdown hasn't been published yet.
                    </p>
                  </Section>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <ListBlock
                    icon={BadgeCheck}
                    title="Licenses"
                    items={b.licenses}
                    empty="No specific licenses listed."
                  />
                  <ListBlock
                    icon={FileText}
                    title="Registrations"
                    items={b.registrations}
                    empty="No specific registrations listed."
                  />
                </div>
              </div>
            </TabsContent>

            {/* Go-To-Market */}
            <TabsContent value="gtm">
              <div className="space-y-8">
                {b.marketingStrategy && (
                  <Section icon={Megaphone} title="Marketing strategy">
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                      {b.marketingStrategy}
                    </p>
                  </Section>
                )}

                {b.revenueModel && (
                  <Section icon={Coins} title="Revenue model">
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                      {b.revenueModel}
                    </p>
                  </Section>
                )}

                {b.riskFactors.length > 0 && (
                  <Section icon={ShieldAlert} title="Risk factors">
                    <ul className="space-y-2">
                      {b.riskFactors.map((r, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {canvasEntries.length > 0 && (
                  <Section icon={Layers} title="Business model canvas">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {canvasEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-2xl border border-border bg-secondary/40 p-4"
                        >
                          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                            {humanizeKey(key)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {renderCanvasValue(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {!b.marketingStrategy &&
                  !b.revenueModel &&
                  b.riskFactors.length === 0 &&
                  canvasEntries.length === 0 && (
                    <EmptyState
                      icon={Megaphone}
                      title="No go-to-market details yet"
                      description="Marketing, revenue and canvas details haven't been published for this idea."
                    />
                  )}
              </div>
            </TabsContent>

            {/* Checklist */}
            <TabsContent value="checklist">
              {checklist.length > 0 ? (
                <ul className="space-y-2">
                  {checklist.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                    >
                      {item.done ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          item.done && 'text-muted-foreground line-through',
                        )}
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="No launch checklist yet"
                  description="A step-by-step checklist hasn't been published for this idea."
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky summary sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <CardContent className="space-y-5 p-6">
              <SummaryRow
                icon={Wallet}
                label="Investment"
                value={`${formatINR(b.minInvestment)} – ${formatINR(b.maxInvestment)}`}
              />
              <SummaryRow icon={TrendingUp} label="Expected profit" value={b.expectedProfit} />
              <SummaryRow icon={Clock} label="Time to launch" value={b.estimatedTime} />
              <SummaryRow
                icon={Rocket}
                label="Growth potential"
                value={GROWTH_LABELS[b.growthPotential]}
              />

              {b.toolsRequired.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Wrench className="h-4 w-4 text-primary" />
                    Tools & equipment
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {b.toolsRequired.map((t, i) => (
                      <Badge key={i} variant="muted">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {b.requiredSkills.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Required skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {b.requiredSkills.map((rs) => (
                      <Badge key={rs.skillId} variant="default">
                        {rs.skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-1">
                {b.roadmap ? (
                  <Button className="w-full" onClick={handleStartRoadmap} disabled={starting}>
                    {starting ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Starting…
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-1.5 h-4 w-4" />
                        Start roadmap
                      </>
                    )}
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    Roadmap coming soon
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBookmark}
                  disabled={bookmarking || bookmarked}
                >
                  {bookmarking ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Bookmark
                      className={cn('mr-1.5 h-4 w-4', bookmarked && 'fill-current')}
                    />
                  )}
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>

              {b.roadmap && (
                <p className="text-center text-xs text-muted-foreground">
                  {b.roadmap.steps.length} step
                  {b.roadmap.steps.length === 1 ? '' : 's'} to launch
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function ListBlock({
  icon: Icon,
  title,
  items,
  empty,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <p className="mb-3 flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </p>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function humanizeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

function renderCanvasValue(value: unknown): string {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value != null && typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
