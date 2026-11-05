'use client';

import React from 'react';
import { ArrowDown, ArrowUpRight, Github, Linkedin, MapPin } from 'lucide-react';
import { LocalTime, Marquee, WordRotator } from './motion/Animated';
import { useMagnetic, useTilt } from './motion/pointer';
import { Chip, Container, landing, lead, profile } from './shared';
import { technologyAvatars } from '@/data/portfolioData';

/** "AI & Product Engineer · 8+ Production Systems · …" → the proof points after the role. */
function proofPoints() {
  const parts = profile.tagline.split(/\s+[·•|]\s+/).map((s) => s.trim()).filter(Boolean);
  return parts[0] === profile.role ? parts.slice(1) : parts;
}

const Word: React.FC<{ children: React.ReactNode; delay: number }> = ({ children, delay }) => (
  <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
    <span className="landing-rise" style={{ ['--d' as string]: `${delay}ms` }}>
      {children}
    </span>
  </span>
);

export const Hero: React.FC = () => {
  const book = useMagnetic<HTMLAnchorElement>(0.35);
  const card = useTilt<HTMLDivElement>(4);
  const sentence = [landing.heroPrefix, landing.rotatingPhrases.join(', '), landing.heroSuffix].filter(Boolean).join(' ');
  const prefixWords = landing.heroPrefix.split(' ');

  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-32 md:pt-40">
      <div className="landing-dots pointer-events-none absolute inset-0 -z-0" aria-hidden="true" />
      <Container className="relative">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <div>
            <p className="landing-fade mb-6 inline-flex items-center gap-2 rounded-full border border-landing-line bg-landing-card px-3 py-1.5 text-xs font-medium text-landing-muted" style={{ ['--d' as string]: '40ms' }}>
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-landing-accent opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-landing-accent" />
              </span>
              {profile.availabilityLine}
            </p>

            <h1 id="hero-title" className="text-[clamp(2.4rem,5vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.045em]">
              <span className="sr-only">{sentence}</span>
              <span aria-hidden="true" className="block">
                {prefixWords.map((w, i) => (
                  <React.Fragment key={i}>
                    <Word delay={120 + i * 70}>{w}</Word>{' '}
                  </React.Fragment>
                ))}
              </span>
              <span aria-hidden="true" className="block text-landing-accent">
                <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span className="landing-rise" style={{ ['--d' as string]: '260ms' }}>
                    <WordRotator words={landing.rotatingPhrases} className="lg:whitespace-nowrap" />
                  </span>
                </span>
              </span>
              {landing.heroSuffix && (
                <span aria-hidden="true" className="block text-landing-muted">
                  {landing.heroSuffix.split(' ').map((w, i) => (
                    <React.Fragment key={i}>
                      <Word delay={360 + i * 60}>{w}</Word>{' '}
                    </React.Fragment>
                  ))}
                </span>
              )}
            </h1>

            <p className="landing-fade mt-7 max-w-[560px] text-[15px] leading-[1.75] text-landing-muted md:text-base" style={{ ['--d' as string]: '520ms' }}>
              {lead(profile.bio)}
            </p>

            <div className="landing-fade mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ ['--d' as string]: '620ms' }}>
              <a
                ref={book}
                href={profile.calendarBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="landing-book-call"
                className="landing-fill inline-flex items-center gap-2 rounded-full bg-landing-ink px-6 py-3.5 text-sm font-medium text-landing-bg transition-transform duration-500 ease-out-soft [--fill:var(--l-accent)]"
              >
                <span data-magnetic-label className="inline-flex items-center gap-2 transition-transform duration-500 ease-out-soft">
                  Book a call <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </a>
              <a href="#work" className="group inline-flex items-center gap-2 text-sm font-medium">
                <span className="landing-link">See my work</span>
                <ArrowDown size={16} aria-hidden="true" className="transition-transform duration-500 ease-out-soft group-hover:translate-y-1" />
              </a>
            </div>
          </div>

          {/* Profile card */}
          <div className="landing-fade w-full max-w-[340px] sm:max-w-[320px]" style={{ ['--d' as string]: '380ms' }}>
            <div ref={card} className="rounded-[28px] border border-landing-line bg-landing-card p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] transition-transform duration-700 ease-out-soft will-change-transform">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-landing-surface">
                {profile.avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
                  <img src={profile.avatarImage} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(120%_80%_at_30%_10%,var(--l-accent-soft),transparent_60%)]">
                    <span className="text-[96px] font-semibold tracking-[-0.06em] text-landing-on-surface">{profile.initials}</span>
                  </div>
                )}
                {landing.timeZone && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl bg-black/45 px-3 py-2 text-xs text-white backdrop-blur-md">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} aria-hidden="true" /> {profile.locationChip}
                    </span>
                    <LocalTime timeZone={landing.timeZone} className="tabular-nums text-white/85" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold tracking-tight">{profile.name}</p>
                  <p className="truncate text-xs text-landing-muted">{profile.role}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-full border border-landing-line transition-colors hover:bg-landing-ink hover:text-landing-bg">
                    <Github size={15} />
                  </a>
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full border border-landing-line transition-colors hover:bg-landing-ink hover:text-landing-bg">
                    <Linkedin size={15} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {proofPoints().length > 0 && (
          <ul className="landing-fade mt-14 flex flex-wrap gap-2" style={{ ['--d' as string]: '720ms' }} aria-label="Highlights">
            {proofPoints().map((p) => (
              <li key={p}>
                <Chip className="bg-landing-card text-[13px]">{p}</Chip>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
};

/** Where the work happened, then the stack as a slow, scroll-reactive marquee. */
export const ProofStrip: React.FC = () => (
  <section aria-label="Companies and stack" className="mt-16 border-y border-landing-line md:mt-20">
    <Container className="grid items-center gap-6 py-6 md:grid-cols-[auto_minmax(0,1fr)] md:gap-10">
      {landing.companies.length > 0 && (
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2" data-reveal>
          <span className="text-xs uppercase tracking-[0.18em] text-landing-muted">Shipped at</span>
          {landing.companies.map((c) => (
            <span key={c} className="text-[15px] font-semibold tracking-tight">
              {c}
            </span>
          ))}
        </div>
      )}
      {technologyAvatars.length > 0 && (
        <Marquee label="Tech stack" className="py-1">
          {technologyAvatars.map((t) => (
            <span key={t.id} className="mr-8 inline-flex items-center gap-2.5 text-sm text-landing-muted">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-black/75"
                style={{ backgroundColor: t.color }}
                aria-hidden="true"
              >
                {t.monogram}
              </span>
              <span className="whitespace-nowrap">{t.name}</span>
            </span>
          ))}
        </Marquee>
      )}
    </Container>
  </section>
);
