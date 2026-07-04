'use client';

import * as React from 'react';
import { Award, FileText, ScrollText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, SkeletonCards, EmptyState } from '@/components/shared/states';
import { CertificateModal, type CertificateData } from '@/components/shared/certificate';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

interface Certificate {
  id: string;
  title: string;
  serial: string;
  issuedAt: string;
  pdfUrl: string | null;
  resource: { id: string; title: string; slug: string } | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CertificatesPage() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = React.useState<Certificate[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<CertificateData | null>(null);

  React.useEffect(() => {
    let alive = true;
    api
      .get<{ items: Certificate[] }>('/users/me/certificates')
      .then((res) => {
        if (alive) setItems(res.data.items);
      })
      .catch((err) => {
        if (alive) setError(err?.message ?? 'Failed to load certificates');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Certificates"
        description="Verified certificates you've earned from completed courses."
      />

      {loading ? (
        <SkeletonCards count={4} />
      ) : error ? (
        <EmptyState icon={ScrollText} title="Couldn't load certificates" description={error} />
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No certificates yet"
          description="Complete a course to earn your first SkillForge certificate."
          actionLabel="Browse courses"
          actionHref="/resources"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((cert) => (
            <Card key={cert.id} className="relative flex h-full flex-col overflow-hidden">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 gradient-sunset" />
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="tile h-11 w-11 shrink-0 gradient-sunset">
                    <Award className="h-6 w-6" />
                  </div>
                  <Badge variant="muted" className="shrink-0 font-mono">
                    {cert.serial}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-base leading-snug">{cert.title}</CardTitle>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Issued {formatDate(cert.issuedAt)}</span>
                </div>
                <Button
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() =>
                    setActive({
                      recipientName: user?.name ?? 'SkillForge Learner',
                      courseTitle: cert.title,
                      serial: cert.serial,
                      issuedAt: cert.issuedAt,
                    })
                  }
                >
                  <Eye className="h-4 w-4" /> View / Print
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {active && <CertificateModal data={active} onClose={() => setActive(null)} />}
    </div>
  );
}
