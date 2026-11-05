import React from 'react';
import { candidateProfile, landingContent, allPlaylists, featuredPlaylist, resumeConfig, recommenders, technologyAvatars } from '@/data/portfolioData';
import { buildLanding } from '@/lib/landing';
import { entryToHash } from '@/lib/routing';
import { cn } from '@/lib/utils';
import { revealDelay } from './motion/reveal';

/** The page model, built once from content. */
export const landing = buildLanding({
  allPlaylists,
  featuredPlaylist,
  resumeConfig,
  recommenders,
  technologyAvatars,
  candidateProfile,
  landingContent,
});

export const profile = candidateProfile;

/** Deep links into the interactive (Spotify-style) version. */
export const appLinks = {
  home: '/',
  playlist: (id: string) => `/${entryToHash({ view: 'playlist', playlistId: id })}`,
  recommender: (id: string) => `/${entryToHash({ view: 'recommender', recommenderId: id })}`,
};

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('mx-auto w-full max-w-[1120px] px-5 md:px-8', className)}>{children}</div>
);

export const SectionHeader: React.FC<{ title: string; id?: string; aside?: React.ReactNode; eyebrow?: string }> = ({ title, id, aside, eyebrow }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-10" data-reveal>
    <div>
      {eyebrow && <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-landing-muted">{eyebrow}</p>}
      <h2 id={id} className="text-[28px] font-medium leading-tight tracking-[-0.03em] md:text-[36px]">
        {title}
      </h2>
    </div>
    {aside && <div className="text-sm text-landing-muted">{aside}</div>}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; className?: string; tone?: 'line' | 'accent' | 'surface' }> = ({ children, className, tone = 'line' }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
      tone === 'line' && 'border border-landing-line text-landing-muted',
      tone === 'accent' && 'bg-landing-accent-soft text-landing-accent',
      tone === 'surface' && 'bg-white/10 text-white/80 backdrop-blur-sm',
      className
    )}
  >
    {children}
  </span>
);

/** Two-letter monogram from a name: "Horquva LLC" → "HL". */
export function monogram(name: string) {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '•';
}

/** First sentence(s) of a paragraph, up to `max` characters. */
export function lead(text: string, max = 230) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > max && out) break;
    out += s;
  }
  return out.trim();
}

export { revealDelay };
