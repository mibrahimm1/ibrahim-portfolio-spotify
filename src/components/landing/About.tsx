'use client';

import React, { useId, useState } from 'react';
import { ArrowUpRight, Download, Plus, Quote } from 'lucide-react';
import { appLinks, Chip, Container, landing, monogram, profile, revealDelay, SectionHeader } from './shared';
import { companyOf, firstClaim } from '@/lib/landing';
import type { Track } from '@/types/portfolio';
import { cn } from '@/lib/utils';

/** "Horquva LLC · Remote (US)" → "Remote (US)". */
const placeOf = (track: Track) => track.subtitle.split(/\s+[·|•–—-]\s+/).slice(1).join(' · ');

/** One role: always shows the headline; expands to the full story on hover, focus or tap. */
const ExperienceRow: React.FC<{ track: Track; index: number }> = ({ track, index }) => {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const id = useId();
  const expanded = open || hover;
  const company = companyOf(track);
  return (
    <li
      data-reveal
      style={revealDelay(index, 60)}
      className="border-b border-landing-line"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        data-testid={`landing-role-${track.id}`}
        className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-5 text-left md:grid-cols-[44px_minmax(0,1.1fr)_minmax(0,1.4fr)_auto] md:gap-x-8"
      >
        <span
          aria-hidden="true"
          className="row-span-2 flex h-11 w-11 items-center justify-center self-start rounded-xl text-[13px] font-bold text-black/75 md:row-span-1 md:self-center"
          style={{ backgroundColor: track.coverColor }}
        >
          {monogram(company)}
        </span>
        <span className="col-start-2 row-start-1 min-w-0">
          <span className="block truncate text-[15px] font-semibold tracking-tight">{company}</span>
          <span className="block truncate text-sm text-landing-muted">{track.title}</span>
        </span>
        <span className="col-span-2 col-start-2 row-start-2 line-clamp-2 text-sm text-landing-muted md:col-span-1 md:col-start-3 md:row-start-1">
          {firstClaim(track.hook)}
        </span>
        <span className="col-start-3 row-start-1 flex items-center justify-end gap-3 text-xs text-landing-muted md:col-start-4">
          <span className="whitespace-nowrap text-right">
            {track.dateAdded}
            {placeOf(track) && <span className="hidden md:block">{placeOf(track)}</span>}
          </span>
          <Plus size={16} aria-hidden="true" className={cn('shrink-0 transition-transform duration-500 ease-out-soft', expanded && 'rotate-45')} />
        </span>
      </button>
      <div id={id} className={cn('grid transition-[grid-template-rows] duration-500 ease-out-soft', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="pb-6 pl-[60px] md:pl-[76px] md:pr-24">
            <p className="text-sm leading-[1.75] text-landing-muted">{track.details}</p>
            {track.credits.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {track.credits.map((c) => (
                  <li key={c.item}>
                    <Chip>{c.item}</Chip>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export const Experience: React.FC = () =>
  landing.experience.length === 0 ? null : (
    <section id="experience" aria-labelledby="experience-title" className="py-24 md:py-28">
      <Container>
        <SectionHeader
          id="experience-title"
          title="Where I've worked"
          aside={
            <a href={profile.resumePdf} download={profile.resumeFileName} className="landing-link inline-flex items-center gap-1.5 font-medium text-landing-ink">
              <Download size={14} aria-hidden="true" /> Full résumé
            </a>
          }
        />
        <ul className="border-t border-landing-line">
          {landing.experience.map((t, i) => (
            <ExperienceRow key={t.id} track={t} index={i} />
          ))}
        </ul>
      </Container>
    </section>
  );

const Column: React.FC<{ title: string; children: React.ReactNode; index: number }> = ({ title, children, index }) => (
  <div data-reveal style={revealDelay(index, 90)} className="min-w-0 rounded-[22px] border border-landing-line bg-landing-card p-6">
    <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-landing-muted">{title}</h3>
    <div className="space-y-5">{children}</div>
  </div>
);

/** Education, research and recognition side by side. */
export const Credentials: React.FC = () => {
  const columns = [
    landing.education.length > 0 && {
      title: 'Education',
      body: landing.education.map((t) => (
        <div key={t.id}>
          <p className="text-[15px] font-semibold tracking-tight">{t.title}</p>
          <p className="text-sm text-landing-muted">{t.subtitle}</p>
          <p className="mt-1 text-xs text-landing-muted">
            {t.dateAdded} · <span className="font-medium text-landing-accent">{t.duration}</span>
          </p>
        </div>
      )),
    },
    landing.publications.length > 0 && {
      title: 'Research',
      body: landing.publications.map((t) => (
        <div key={t.id}>
          <p className="text-[15px] font-semibold leading-snug tracking-tight">{t.title}</p>
          <p className="mt-1 text-sm text-landing-muted">
            {t.album} · {t.dateAdded}
          </p>
          {t.externalUrl && (
            <a href={t.externalUrl} target="_blank" rel="noopener noreferrer" className="landing-link mt-2 inline-flex items-center gap-1 text-sm font-medium">
              Read the paper <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      )),
    },
    landing.honors.length > 0 && {
      title: 'Recognition',
      body: (
        <ul className="space-y-3">
          {landing.honors.map((t) => (
            <li key={t.id} className="flex gap-3">
              <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-landing-accent" />
              <span>
                <span className="block text-sm font-medium leading-snug">{t.title}</span>
                <span className="block text-xs text-landing-muted">
                  {t.subtitle} · {t.dateAdded}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ),
    },
  ].filter(Boolean) as { title: string; body: React.ReactNode }[];

  if (columns.length === 0) return null;
  return (
    <section id="about" aria-labelledby="about-title" className="py-24 md:py-28">
      <Container>
        <SectionHeader id="about-title" title="Education & recognition" />
        <div className={cn('grid gap-5', columns.length >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2')}>
          {columns.map((c, i) => (
            <Column key={c.title} title={c.title} index={i}>
              {c.body}
            </Column>
          ))}
        </div>
      </Container>
    </section>
  );
};

export const Testimonials: React.FC = () =>
  landing.testimonials.length === 0 ? null : (
    <section aria-labelledby="testimonials-title" className="py-24 md:py-28">
      <Container>
        <SectionHeader id="testimonials-title" title="What mentors say" />
        <div className={cn('grid gap-5', landing.testimonials.length > 2 ? 'lg:grid-cols-3' : 'md:grid-cols-2')}>
          {landing.testimonials.map((t, i) => (
            <figure
              key={t.id}
              data-reveal
              style={revealDelay(i, 90)}
              className="group flex min-w-0 flex-col justify-between rounded-[22px] border border-landing-line bg-landing-card p-7 transition-[transform,box-shadow] duration-500 ease-out-soft hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.35)]"
            >
              <div>
                <Quote size={22} aria-hidden="true" className="text-landing-accent" />
                <blockquote className="mt-4 text-lg leading-[1.6] tracking-[-0.01em] md:text-xl">{t.quote}</blockquote>
              </div>
              <figcaption className="mt-8 flex items-center gap-3">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
                  <img src={t.photo} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-landing-ink text-xs font-bold text-landing-bg">
                    {t.initials}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block truncate text-xs text-landing-muted">{t.title}</span>
                </span>
                <a
                  href={appLinks.recommender(t.id)}
                  className="landing-link shrink-0 text-xs font-medium text-landing-muted hover:text-landing-ink"
                  aria-label={`Read ${t.name}'s full letter`}
                >
                  Full letter
                </a>
              </figcaption>
              <Chip tone="accent" className="mt-5 self-start whitespace-normal">
                {t.ranking}
              </Chip>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );

/** Leadership and volunteering as a swipeable row of cards. */
export const BeyondWork: React.FC = () =>
  landing.beyondWork.length === 0 ? null : (
    <section aria-labelledby="beyond-title" className="py-24 md:py-28">
      <Container>
        <SectionHeader id="beyond-title" title="Beyond work" aside="Leadership and community" />
      </Container>
      <div className="no-scrollbar overflow-x-auto overscroll-x-contain [scroll-padding-inline:max(20px,calc((100vw-1120px)/2+32px))] [scroll-snap-type:x_mandatory]">
        <ul className="flex w-max gap-4 px-5 pb-4 md:px-[max(32px,calc((100vw-1120px)/2+32px))]">
          {landing.beyondWork.map((t, i) => (
            <li
              key={t.id}
              data-reveal
              style={revealDelay(i, 60)}
              className="flex w-[280px] shrink-0 snap-start flex-col rounded-[22px] border border-landing-line bg-landing-card p-6 md:w-[320px]"
            >
              <span aria-hidden="true" className="mb-6 h-1.5 w-10 rounded-full" style={{ backgroundColor: t.coverColor }} />
              <p className="text-[15px] font-semibold leading-snug tracking-tight">{t.title}</p>
              <p className="mt-1 text-sm text-landing-muted">{t.subtitle}</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-landing-muted">{firstClaim(t.hook)}</p>
              <p className="mt-5 text-xs text-landing-muted">{t.dateAdded}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
