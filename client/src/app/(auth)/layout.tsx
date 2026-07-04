import Link from 'next/link';
import { Flame } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center bg-hero-grid [background-size:22px_22px] px-6 py-16">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Flame className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold">SkillForge</span>
          </Link>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
