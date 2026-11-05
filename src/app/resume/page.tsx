'use client';

import React, { useRef } from 'react';
import './landing.css';
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero, ProofStrip } from '@/components/landing/Hero';
import { Work } from '@/components/landing/Work';
import { BeyondWork, Credentials, Experience, Testimonials } from '@/components/landing/About';
import { Contact, LandingFooter } from '@/components/landing/Contact';
import { PrintResume } from '@/components/landing/PrintResume';
import { useReveals } from '@/components/landing/motion/reveal';

/**
 * The standard portfolio: a classic single-page layout for visitors who'd rather skip the
 * Spotify-style app (every "Standard resume view" link lands here). All content comes from
 * content/portfolio.json; printing it gives a compact one-page résumé (PrintResume).
 */
export default function StandardPortfolioPage() {
  const root = useRef<HTMLDivElement>(null);
  useReveals(root);

  return (
    <div ref={root} data-landing data-testid="standard-resume-container" className="min-h-screen font-spotify antialiased">
      <a
        href="#work"
        className="sr-only z-[80] rounded-full bg-landing-ink px-4 py-2 text-sm text-landing-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to work
      </a>
      <div data-screen-only>
        <LandingNav />
        <main className="relative z-10 bg-landing-bg">
          <Hero />
          <ProofStrip />
          <Work />
          <Experience />
          <Credentials />
          <Testimonials />
          <BeyondWork />
        </main>
        <Contact />
        <LandingFooter />
      </div>
      <PrintResume />
    </div>
  );
}
