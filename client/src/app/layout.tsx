import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'SkillForge — Turn Skills Into Successful Businesses',
    template: '%s · SkillForge',
  },
  description:
    'SkillForge is an entrepreneurship enablement platform. Discover business ideas from your skills, learn the essentials, follow a roadmap, connect with mentors, and launch your micro-enterprise.',
  keywords: ['entrepreneurship', 'business ideas', 'skills', 'startup', 'mentorship', 'SkillForge'],
  authors: [{ name: 'V. Saatwik Sairaam' }],
  openGraph: {
    title: 'SkillForge — Turn Skills Into Successful Businesses',
    description: 'Discover, learn, and launch your own business.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
