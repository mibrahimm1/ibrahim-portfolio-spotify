import type { PortfolioRuntime } from '@/data/portfolioData';
import type { Recommender, Track } from '@/types/portfolio';
import { deepTone, withAlpha } from '@/lib/color';

/**
 * Everything the standard portfolio page (/resume) shows, derived from content. Pure, so
 * the defaults (for forks that never fill in `landing`) can be unit-tested.
 */

export interface Poster {
  /** Big first line: a leading figure such as "89%" or "1st", or the whole claim. */
  figure: string;
  /** Second line, shown smaller (empty when the claim has no leading figure). */
  claim: string;
  /** Gradient stops derived from the item's own cover colour. */
  from: string;
  to: string;
  glow: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  ranking: string;
  quote: string;
  initials: string;
  photo?: string;
}

export interface LandingModel {
  heroPrefix: string;
  rotatingPhrases: string[];
  heroSuffix?: string;
  featured: Track[];
  moreProjects: Track[];
  experience: Track[];
  education: Track[];
  publications: Track[];
  honors: Track[];
  beyondWork: Track[];
  companies: string[];
  testimonials: Testimonial[];
  timeZone?: string;
  contactHeading: string;
  contactLine: string;
}

type Source = Pick<
  PortfolioRuntime,
  'allPlaylists' | 'featuredPlaylist' | 'resumeConfig' | 'recommenders' | 'technologyAvatars' | 'candidateProfile' | 'landingContent'
>;

/** "Horquva LLC · Remote (US)" → "Horquva LLC". */
export function companyOf(track: Track): string {
  return track.subtitle.split(/\s+[·|•–—-]\s+/)[0].trim();
}

/** First segment of a "·"-separated hook. */
export function firstClaim(hook: string): string {
  return hook.split(/\s+[·•|]\s+/)[0].trim();
}

/** Splits "89% Fewer Hallucinations" into a figure and the rest; no figure → whole claim. */
export function splitFigure(claim: string): { figure: string; claim: string } {
  const match = claim.match(/^((?:[<>~≈+]?\$?\d[\d.,]*(?:\s?[%x×+kKmMbB]|st|nd|rd|th)?)|(?:Top\s\d+%?))\s+(.+)$/);
  return match ? { figure: match[1], claim: match[2] } : { figure: claim, claim: '' };
}

export function posterFor(track: Track): Poster {
  const { figure, claim } = splitFigure(firstClaim(track.hook));
  return {
    figure,
    claim,
    from: deepTone(track.coverColor, 0.3, 0.55),
    to: deepTone(track.coverColor, 0.1, 0.5),
    glow: withAlpha(track.coverColor, 0.45),
  };
}

/** The letter's opening line is usually a formality, so prefer the second paragraph. */
export function defaultQuote(letter: string[]): string {
  const paragraph = letter[1] ?? letter[0] ?? '';
  const sentence = paragraph.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? paragraph;
  return sentence.length > 240 ? `${sentence.slice(0, 237).trimEnd()}…` : sentence;
}

function initialsOf(name: string): string {
  const words = name.replace(/^(Dr|Prof|Asst|Assoc|Mr|Ms|Mrs)\.?\s+/gi, '').split(/\s+/).filter(Boolean);
  return (words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '');
}

export function buildLanding(src: Source): LandingModel {
  const landing = src.landingContent;
  const playlists = src.allPlaylists;
  const tracksOf = (id: string | undefined) => (id ? playlists.find((p) => p.id === id)?.tracks ?? [] : []);
  const section = (variant: string) => src.resumeConfig.sections.filter((s) => s.variant === variant);
  const tracksFor = (variant: string) => section(variant).flatMap((s) => tracksOf(s.playlistId).slice(0, s.limit));

  const projectsId = landing.projectsPlaylistId ?? src.featuredPlaylist.id;
  const projects = tracksOf(projectsId);
  const picked = (landing.featuredProjectIds ?? [])
    .map((id) => projects.find((t) => t.id === id))
    .filter((t): t is Track => Boolean(t));
  const featured = picked.length > 0 ? picked : projects.slice(0, 4);
  const moreProjects = projects.filter((t) => !featured.includes(t));

  const experience = tracksFor('experience');
  const used = new Set([projectsId, ...src.resumeConfig.sections.map((s) => s.playlistId), 'recruiter-mix']);
  const beyondWork = playlists.filter((p) => !used.has(p.id)).flatMap((p) => p.tracks);

  const categories = [...new Set(src.technologyAvatars.map((t) => t.category.toLowerCase()))].slice(0, 5);
  const rotatingPhrases = landing.rotatingPhrases ?? (categories.length > 0 ? categories : [src.candidateProfile.role]);

  return {
    heroPrefix: landing.heroPrefix ?? 'I build',
    rotatingPhrases,
    heroSuffix: landing.heroSuffix,
    featured,
    moreProjects,
    experience,
    education: tracksFor('education'),
    publications: tracksFor('publication'),
    honors: tracksFor('bullets'),
    beyondWork,
    companies: [...new Set(experience.map(companyOf))],
    testimonials: src.recommenders.map((r: Recommender) => ({
      id: r.id,
      name: r.name,
      title: r.title,
      affiliation: r.affiliation,
      ranking: r.ranking,
      quote: r.quote ?? defaultQuote(r.fullLetter),
      initials: r.avatarInitials || initialsOf(r.name),
      photo: r.photo,
    })),
    timeZone: landing.timeZone,
    contactHeading: landing.contactHeading ?? 'Have something in mind?',
    contactLine: landing.contactLine ?? src.candidateProfile.availabilityLine,
  };
}
