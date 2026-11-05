'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, Phone } from 'lucide-react';
import { LocalTime } from './motion/Animated';
import { useMagnetic } from './motion/pointer';
import { appLinks, Container, landing, profile } from './shared';

const CopyEmail: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      data-testid="landing-copy-email"
      className="group inline-flex items-center gap-2 rounded-full border border-landing-line bg-landing-card px-4 py-2.5 text-sm transition-colors hover:border-landing-ink"
    >
      <Mail size={15} aria-hidden="true" />
      <span>{profile.email}</span>
      <span className="ml-1 text-landing-muted transition-colors group-hover:text-landing-ink" aria-hidden="true">
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Email address copied' : 'Copy email address'}
      </span>
    </button>
  );
};

/** The closing call to action. Its rounded bottom edge lifts off the ink footer below. */
export const Contact: React.FC = () => {
  const button = useMagnetic<HTMLAnchorElement>(0.4);
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative z-10 rounded-b-[40px] bg-landing-bg pb-28 pt-24 shadow-[0_30px_40px_-20px_rgba(0,0,0,0.18)] md:rounded-b-[64px] md:pb-36 md:pt-32">
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_auto]">
          <div data-reveal>
            <h2 id="contact-title" className="max-w-[720px] text-[clamp(2.25rem,5.6vw,4.25rem)] font-medium leading-[1.04] tracking-[-0.045em]">
              {landing.contactHeading}
            </h2>
            <p className="mt-5 max-w-[520px] text-base leading-relaxed text-landing-muted">{landing.contactLine}</p>
            <div className="mt-9 flex flex-wrap gap-2.5">
              <CopyEmail />
              <a
                href={`tel:${profile.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-full border border-landing-line bg-landing-card px-4 py-2.5 text-sm transition-colors hover:border-landing-ink"
              >
                <Phone size={15} aria-hidden="true" /> {profile.phoneDisplay}
              </a>
            </div>
          </div>
          <div data-reveal className="flex justify-start md:justify-end" style={{ ['--d' as string]: '120ms' }}>
            <a
              ref={button}
              href={profile.calendarBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="landing-get-in-touch"
              className="landing-fill flex h-40 w-40 items-center justify-center rounded-full bg-landing-ink text-landing-bg transition-transform duration-500 ease-out-soft [--fill:var(--l-accent)] md:h-48 md:w-48"
            >
              <span data-magnetic-label className="inline-flex items-center gap-1.5 text-[15px] font-medium transition-transform duration-500 ease-out-soft">
                Book a call <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
};

/** Sticks under the page, so the contact section's rounded edge reveals it as you reach the end. */
export const LandingFooter: React.FC = () => (
  <footer className="sticky bottom-0 z-0 -mt-12 bg-landing-surface pb-10 pt-24 text-landing-on-surface md:-mt-16 md:pt-28">
    <Container>
      <div className="grid gap-8 text-sm sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/45">Local time</p>
          {landing.timeZone ? <LocalTime timeZone={landing.timeZone} className="tabular-nums" /> : <span>{profile.locationChip}</span>}
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/45">Based in</p>
          <span>{profile.locations.slice(0, 2).join(' · ') || profile.locationChip}</span>
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/45">Elsewhere</p>
          <div className="flex gap-4">
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="landing-link inline-flex items-center gap-1.5">
              <Github size={14} aria-hidden="true" /> GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="landing-link inline-flex items-center gap-1.5">
              <Linkedin size={14} aria-hidden="true" /> LinkedIn
            </a>
          </div>
        </div>
        <div className="md:text-right">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/45">Prefer something playful?</p>
          <a href={appLinks.home} className="landing-link inline-flex items-center gap-1.5">
            Open the interactive version <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="mt-14 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/45">
        <span suppressHydrationWarning>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <a href="#top" className="landing-link">
          Back to top ↑
        </a>
      </div>
    </Container>
  </footer>
);
