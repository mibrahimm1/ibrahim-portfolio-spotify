'use client';

import React, { useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CountUp } from './motion/Animated';
import { useFollower } from './motion/pointer';
import { appLinks, Chip, Container, landing, revealDelay, SectionHeader } from './shared';
import { posterFor } from '@/lib/landing';
import type { Track } from '@/types/portfolio';
import { cn } from '@/lib/utils';

/** Best destination for a project: its live demo, its write-up, or its page in the app. */
function hrefFor(track: Track) {
  return track.demoUrl ?? track.externalUrl ?? appLinks.playlist(track.playlistId);
}
const isExternal = (href: string) => /^https?:/.test(href);

/** "Konvex — AI-Native Multi-Platform…" → ["Konvex", "AI-Native Multi-Platform…"]. */
function splitTitle(title: string): [string, string] {
  const [name, ...rest] = title.split(/\s+[—–-]\s+/);
  return [name, rest.join(' — ')];
}

/** The generated cover: the project's measured result, set large on its own colour. */
export const PosterArt: React.FC<{ track: Track; compact?: boolean; className?: string }> = ({ track, compact, className }) => {
  const p = posterFor(track);
  return (
    <div
      className={cn('relative flex h-full w-full flex-col justify-between overflow-hidden p-5 text-white md:p-7', className)}
      style={{ backgroundImage: `radial-gradient(120% 90% at 85% 0%, ${p.glow}, transparent 55%), linear-gradient(160deg, ${p.from}, ${p.to})` }}
    >
      {/* fine grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '44px 44px', maskImage: 'linear-gradient(to bottom, #000, transparent 85%)' }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <Chip tone="surface">{track.duration}</Chip>
        {track.statusBadge && <Chip tone="surface">{track.statusBadge}</Chip>}
      </div>
      <div className="relative">
        {/* A short figure ("89%", "1st") is set huge; a claim without one reads as a headline. */}
        <p
          className={cn(
            'font-semibold tracking-[-0.05em]',
            p.figure.length <= 10
              ? cn('leading-[0.95]', compact ? 'text-[44px]' : 'text-[clamp(3rem,7vw,5.25rem)]')
              : cn('line-clamp-3 leading-[1.05] tracking-[-0.035em]', compact ? 'text-[22px]' : 'text-[clamp(1.75rem,3.4vw,2.6rem)]')
          )}
        >
          {compact || p.figure.length > 10 ? p.figure : <CountUp value={p.figure} />}
        </p>
        {p.claim && <p className={cn('mt-2 max-w-[90%] font-medium leading-snug text-white/80', compact ? 'text-sm' : 'text-base md:text-lg')}>{p.claim}</p>}
      </div>
      {track.coverImage && !compact && (
        // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
        <img src={track.coverImage} alt="" loading="lazy" className="absolute -bottom-6 right-5 w-[46%] rotate-[-4deg] rounded-xl shadow-2xl ring-1 ring-white/15" />
      )}
    </div>
  );
};

const PosterCard: React.FC<{ track: Track; index: number }> = ({ track, index }) => {
  const [name, rest] = splitTitle(track.title);
  const href = hrefFor(track);
  return (
    <article className="group" data-reveal style={revealDelay(index % 2, 90)} data-testid={`landing-poster-${track.id}`}>
      <a
        href={href}
        target={isExternal(href) ? '_blank' : undefined}
        rel={isExternal(href) ? 'noopener noreferrer' : undefined}
        className="relative block aspect-[16/11] overflow-hidden rounded-[22px] bg-landing-surface"
        aria-label={`${name}: ${track.hook}`}
      >
        <div className="h-full w-full transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]">
          <PosterArt track={track} />
        </div>
        <span className="absolute right-4 top-4 flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-500 ease-out-soft group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </a>
      <div className="px-1 pt-5">
        <p className="text-xs text-landing-muted">
          {track.album} · {track.dateAdded}
        </p>
        <h3 className="mt-1.5 text-xl font-medium tracking-[-0.02em]">
          {name}
          {rest && <span className="text-landing-muted"> — {rest}</span>}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-landing-muted">{track.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <ul className="flex flex-wrap gap-1.5" aria-label="Built with">
            {track.credits.slice(0, 4).map((c) => (
              <li key={c.item}>
                <Chip>{c.item}</Chip>
              </li>
            ))}
          </ul>
          <div className="flex gap-4 text-sm font-medium">
            {track.externalUrl && (
              <a href={track.externalUrl} target="_blank" rel="noopener noreferrer" className="landing-link inline-flex items-center gap-1">
                Case study <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
            {track.demoUrl && (
              <a href={track.demoUrl} target="_blank" rel="noopener noreferrer" className="landing-link inline-flex items-center gap-1">
                Live demo <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

/**
 * The remaining projects as big type. With a mouse, a preview of the hovered project's
 * poster trails the cursor and a "View" bubble rides on top; the other rows dim. On touch
 * (or with reduced motion) it's a plain list with the result shown under each title.
 */
const ProjectList: React.FC<{ tracks: Track[] }> = ({ tracks }) => {
  const list = useRef<HTMLUListElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { enabled, inside } = useFollower(list, [
    { ref: card, ease: 0.14 },
    { ref: bubble, ease: 0.3 },
  ]);

  return (
    <div className="relative mt-20">
      <SectionHeader title="More projects" aside={`${tracks.length} more`} />
      <ul ref={list} className="group/list border-t border-landing-line" data-testid="landing-project-list">
        {tracks.map((t, i) => {
          const [name] = splitTitle(t.title);
          const href = hrefFor(t);
          return (
            <li key={t.id} data-reveal style={revealDelay(i, 50)} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)}>
              <a
                href={href}
                target={isExternal(href) ? '_blank' : undefined}
                rel={isExternal(href) ? 'noopener noreferrer' : undefined}
                className="group/row grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-landing-line py-6 transition-[opacity] duration-500 md:grid-cols-[3rem_minmax(0,1fr)_auto] md:py-8 group-hover/list:opacity-40 hover:!opacity-100 focus-visible:!opacity-100"
              >
                <span className="text-xs tabular-nums text-landing-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className="block text-[26px] font-medium leading-tight tracking-[-0.035em] transition-transform duration-500 ease-out-soft group-hover/row:translate-x-3 group-focus-visible/row:translate-x-3 md:text-[44px]">
                    {name}
                  </span>
                  <span className={cn('mt-1 block text-sm text-landing-muted', enabled && 'md:hidden')}>{t.hook.split(/\s+[·•|]\s+/)[0]}</span>
                </span>
                <span className="col-start-2 mt-2 text-sm text-landing-muted md:col-start-auto md:mt-0">{t.duration}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {enabled && (
        <>
          <div
            ref={card}
            aria-hidden="true"
            data-testid="landing-project-preview"
            data-visible={inside || undefined}
            className={cn(
              'landing-follow z-40 h-[230px] w-[320px] overflow-hidden rounded-[18px] shadow-2xl transition-[opacity,scale] duration-500 ease-out-soft',
              inside ? 'opacity-100 [scale:1]' : 'opacity-0 [scale:0.5]'
            )}
          >
            <div className="h-full transition-transform duration-700 ease-out-soft" style={{ transform: `translateY(${-active * 100}%)` }}>
              {tracks.map((t) => (
                <div key={t.id} className="h-full">
                  <PosterArt track={t} compact />
                </div>
              ))}
            </div>
          </div>
          <div
            ref={bubble}
            aria-hidden="true"
            className={cn(
              'landing-follow z-40 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-landing-accent text-sm font-medium text-landing-bg transition-[opacity,scale] duration-300 ease-out-soft',
              inside ? 'opacity-100 [scale:1]' : 'opacity-0 [scale:0]'
            )}
          >
            View
          </div>
        </>
      )}
    </div>
  );
};

export const Work: React.FC = () => (
  <section id="work" aria-labelledby="work-title" className="py-24 md:py-32">
    <Container>
      <SectionHeader
        id="work-title"
        title="Selected work"
        aside={`${landing.featured.length + landing.moreProjects.length} projects · measured, shipped, documented`}
      />
      <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
        {landing.featured.map((t, i) => (
          <PosterCard key={t.id} track={t} index={i} />
        ))}
      </div>
      {landing.moreProjects.length > 0 && <ProjectList tracks={landing.moreProjects} />}
    </Container>
  </section>
);
