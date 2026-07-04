'use client';

import * as React from 'react';
import { Award, Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CertificateData {
  recipientName: string;
  courseTitle: string;
  serial: string;
  issuedAt: string | Date;
}

function formatDate(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * An elegant, printable certificate. Renders as a full-screen overlay with a
 * decorative bordered certificate. `window.print()` prints just the certificate
 * (page-level print CSS scopes visibility to the .certificate-print node).
 */
export function CertificateModal({
  data,
  onClose,
}: {
  data: CertificateData;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8">
      {/* Print scoping styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .certificate-print, .certificate-print * { visibility: visible !important; }
          .certificate-print {
            position: absolute !important;
            left: 0; top: 0;
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .certificate-noprint { display: none !important; }
          @page { size: landscape; margin: 12mm; }
        }
      `}</style>

      <div className="certificate-noprint mb-4 flex w-full max-w-3xl items-center justify-between text-white">
        <span className="text-sm font-medium opacity-80">Certificate preview</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => window.print()} className="gap-1.5">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/15"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Certificate data={data} />
    </div>
  );
}

/** The certificate document itself (bordered, printable). */
export function Certificate({ data }: { data: CertificateData }) {
  return (
    <div className="certificate-print w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
      <div className="relative m-3 border-4 border-double border-navy/70 p-8 sm:m-4 sm:p-12">
        {/* Corner flourishes */}
        <span className="pointer-events-none absolute left-2 top-2 h-8 w-8 rounded-tl-md border-l-2 border-t-2 border-primary" />
        <span className="pointer-events-none absolute right-2 top-2 h-8 w-8 rounded-tr-md border-r-2 border-t-2 border-primary" />
        <span className="pointer-events-none absolute bottom-2 left-2 h-8 w-8 rounded-bl-md border-b-2 border-l-2 border-primary" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-8 w-8 rounded-br-md border-b-2 border-r-2 border-primary" />

        <div className="text-center text-navy">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Award className="h-8 w-8" />
          </div>

          <p className="text-lg font-black uppercase tracking-[0.3em] text-primary">SkillForge</p>
          <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-navy/50">
            Certificate of Completion
          </p>

          <p className="mt-8 text-sm text-navy/60">This certifies that</p>
          <p className="mt-2 font-serif text-3xl font-bold text-navy sm:text-4xl">
            {data.recipientName}
          </p>
          <div className="mx-auto mt-3 h-px w-40 bg-navy/20" />

          <p className="mt-6 text-sm text-navy/60">has successfully completed</p>
          <p className="mt-2 text-xl font-bold text-navy sm:text-2xl">{data.courseTitle}</p>

          <div className="mt-12 flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-end">
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-navy/50">Issued on</p>
              <p className="mt-1 font-semibold text-navy">{formatDate(data.issuedAt)}</p>
            </div>

            <div className="text-center">
              <p className="border-b-2 border-navy/40 px-6 pb-1 font-serif text-lg italic text-navy">
                V. Saatwik Sairaam
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-navy/50">
                Founder &amp; Issuer
              </p>
            </div>
          </div>

          <p className="mt-10 text-[0.7rem] uppercase tracking-widest text-navy/40">
            Verification Serial: <span className="font-semibold text-navy/60">{data.serial}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
