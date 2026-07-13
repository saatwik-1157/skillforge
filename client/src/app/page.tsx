import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import {
  Stats,
  HowItWorks,
  Categories,
  FeaturedIdeas,
  MentorHighlights,
  Testimonials,
  FAQ,
} from '@/components/landing/Sections';
import { CTA } from '@/components/landing/CTA';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <Stats />
        <HowItWorks />
        <Categories />
        <FeaturedIdeas />
        <MentorHighlights />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
