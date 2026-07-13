'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/shared/states';

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MentorApplyPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [headline, setHeadline] = React.useState('');
  const [expertise, setExpertise] = React.useState('');
  const [yearsExperience, setYearsExperience] = React.useState('');
  const [languages, setLanguages] = React.useState('');
  const [hourlyRate, setHourlyRate] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const expertiseList = parseList(expertise);
    const languagesList = parseList(languages);

    if (headline.trim().length < 4) {
      toast.error('Headline must be at least 4 characters.');
      return;
    }
    if (expertiseList.length === 0) {
      toast.error('Add at least one area of expertise.');
      return;
    }
    if (languagesList.length === 0) {
      toast.error('Add at least one language.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/mentors/apply', {
        headline: headline.trim(),
        expertise: expertiseList,
        yearsExperience: Number(yearsExperience) || 0,
        languages: languagesList,
        hourlyRate: Number(hourlyRate) || 0,
      });
      toast.success('Application submitted! Your mentor profile is pending verification.');
      router.push('/dashboard/mentor');
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Could not submit your application.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="container-page py-16">
        {!isAuthenticated ? (
          <Spinner />
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-orange-700 dark:text-primary">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Become a mentor
              </h1>
              <p className="mt-2 text-muted-foreground">
                Share your expertise and guide aspiring entrepreneurs.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mentor application</CardTitle>
                <CardDescription>
                  Your profile will be reviewed before it goes live.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Growth marketer helping D2C founders scale"
                      maxLength={160}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="expertise">Expertise</Label>
                    <Input
                      id="expertise"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      placeholder="Marketing, Fundraising, Product"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Separate skills with commas.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="languages">Languages</Label>
                    <Input
                      id="languages"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="English, Hindi, Tamil"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Separate languages with commas.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="yearsExperience">Years of experience</Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min={0}
                        max={80}
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        placeholder="5"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="hourlyRate">Hourly rate (₹)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min={0}
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="0 for free"
                      />
                      <p className="text-xs text-muted-foreground">Leave 0 to mentor for free.</p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit application'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
