import rawContent from '../../content/portfolio.json';
import type { PortfolioContent } from '@/content/schema';
import { AccentTheme, Playlist, Track } from '@/types/portfolio';

/**
 * Loads content/portfolio.json, the only place portfolio content lives.
 *
 * Validation runs in two places, so invalid content can never reach production:
 *  - `npm run build` runs `content:validate` (the zod schema) before `next build`;
 *  - the dev server parses the file on every load and shows a readable error overlay.
 * Production bundles skip the runtime parse, which keeps zod out of visitors' JavaScript.
 * Edit the JSON through the dev-only dashboard (`npm run dev` → /dashboard) or by hand.
 */

export const RECRUITER_MIX_PLAYLIST_ID = 'recruiter-mix';

/** Turns validated content into the shapes the UI uses. Pure, so the dashboard can preview drafts. */
export function buildRuntime(content: PortfolioContent) {
  const playlists: Playlist[] = content.playlists.map((p) => {
    const tracks: Track[] = p.tracks.map((t, i) => ({ ...t, playlistId: p.id, number: i + 1 }));
    return { ...p, tracks, trackCount: tracks.length };
  });

  const recruiterMix: Playlist = {
    id: RECRUITER_MIX_PLAYLIST_ID,
    title: content.recruiterMix.title,
    description: content.recruiterMix.description,
    subtitle: content.recruiterMix.subtitle,
    aboutLabel: 'About',
    coverColor: '#E57BA1',
    artKind: 'heart',
    trackCount: 0,
    tracks: [],
    isPinned: true,
  };

  const accentThemeList: AccentTheme[] = content.accentThemes.map((t) => ({
    ...t,
    gradient: `linear-gradient(180deg, ${t.banner} 0%, #121212 100%)`,
  }));

  const byId = (id: string) => playlists.find((p) => p.id === id)?.tracks ?? [];
  const featuredPlaylist = playlists.find((p) => p.id === content.home.featuredPlaylistId) ?? playlists[0];

  return {
    content,
    site: content.site,
    candidateProfile: content.profile,
    homeConfig: content.home,
    technologyAvatars: content.technologies,
    /** Index 0 is always the virtual, bookmark-driven Recruiter Mix. */
    allPlaylists: [recruiterMix, ...playlists],
    featuredPlaylist,
    recommenders: content.recommenders,
    starterPrompts: content.starterPrompts,
    accentThemeList,
    accentThemes: Object.fromEntries(accentThemeList.map((t) => [t.id, t])) as Record<string, AccentTheme>,
    defaultAccentThemeId: accentThemeList[0].id,
    aiConfig: content.ai,
    coverLetterStanzas: content.coverLetterStanzas,
    whatsNew: content.whatsNew,
    resumeConfig: content.resume,
    footer: content.footer,
    // Named section arrays kept for existing callers and tests; empty if a fork removes the playlist.
    featuredProjectsTracks: featuredPlaylist.tracks,
    workExperienceTracks: byId('work-experience'),
    educationTracks: byId('education'),
    publicationTracks: byId('research-publications'),
    volunteeringTracks: byId('volunteering-leadership'),
    certificationsTracks: byId('certifications-honors'),
  };
}

export type PortfolioRuntime = ReturnType<typeof buildRuntime>;

function loadContent(): PortfolioContent {
  // Dev server only: tests validate the file directly (content.test.ts), and production
  // builds run `content:validate` first, then compile this branch (and zod) away.
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { parseContent } = require('./validateContent') as typeof import('./validateContent');
    return parseContent(rawContent);
  }
  return rawContent as PortfolioContent;
}

const runtime = buildRuntime(loadContent());

export const {
  site,
  candidateProfile,
  homeConfig,
  technologyAvatars,
  allPlaylists,
  featuredPlaylist,
  recommenders,
  starterPrompts,
  accentThemeList,
  accentThemes,
  defaultAccentThemeId,
  aiConfig,
  coverLetterStanzas,
  whatsNew,
  resumeConfig,
  footer,
  featuredProjectsTracks,
  workExperienceTracks,
  educationTracks,
  publicationTracks,
  volunteeringTracks,
  certificationsTracks,
} = runtime;
