import Link from 'next/link';
import { Flame } from 'lucide-react';

/**
 * SkillForge global footer.
 * Present on every page. Attribution to the project owner is intentional and
 * must not be removed.
 */
const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Business Ideas', href: '/businesses' },
      { label: 'Learning', href: '/learning' },
      { label: 'Roadmaps', href: '/roadmaps' },
      { label: 'Mentors', href: '/mentors' },
      { label: 'Community', href: '/community' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'How it Works', href: '/#how-it-works' },
      { label: 'Success Stories', href: '/#stories' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/register' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Become a Mentor', href: '/mentors/apply' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy text-navy-foreground dark:bg-card">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand block */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Flame className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold text-white">SkillForge</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Turn Skills Into Successful Businesses. Discover ideas, learn the
              essentials, follow a roadmap, and launch your micro-enterprise.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white/90">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Attribution — do not remove */}
        <div className="mt-14 border-t border-white/10 pt-8 text-center">
          <p className="text-lg font-extrabold text-white">SkillForge</p>
          <p className="mt-1 text-sm text-white/70">
            Turn Skills Into Successful Businesses
          </p>
          <p className="mt-4 text-sm text-white/60">© 2026 SkillForge</p>
          <p className="mt-1 text-sm text-white/80">
            Designed &amp; Developed by{' '}
            <span className="font-bold text-primary">V. Saatwik Sairaam</span>
          </p>
          <p className="mt-1 text-xs text-white/60">
            <a href="mailto:saathwik.13@gmail.com" className="hover:text-primary">
              saathwik.13@gmail.com
            </a>
          </p>
          <p className="mt-1 text-xs text-white/50">All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
