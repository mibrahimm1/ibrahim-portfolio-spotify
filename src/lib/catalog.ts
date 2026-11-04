import { Playlist, Track } from '@/types/portfolio';
import { allPlaylists, candidateProfile, coverLetterStanzas, featuredPlaylist, technologyAvatars } from '@/data/portfolioData';

export const RECRUITER_MIX_ID = 'recruiter-mix';
export const TECH_PLAYLIST_PREFIX = 'tech:';
export const RECRUITER_MIX_GRADIENT = 'linear-gradient(135deg, #450af5 0%, #c4efd9 100%)';

/** Seconds each "track" highlight runs for on the silent player timer. */
export const TRACK_DURATION_SECONDS = 30;

const stanzaWordCounts = coverLetterStanzas.map((s) => s.split(/\s+/).length);
const totalStanzaWords = stanzaWordCounts.reduce((a, b) => a + b, 0);

/** The cover letter runs at a comfortable ~3 words per second. */
export const LYRICS_DURATION_SECONDS = Math.max(TRACK_DURATION_SECONDS, Math.round(totalStanzaWords / 3));

/** Fraction (0-1) of the lyrics timeline at which each stanza starts, weighted by length. */
export const stanzaStartFractions: number[] = stanzaWordCounts.reduce<number[]>((acc, _count, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + stanzaWordCounts[i - 1] / totalStanzaWords);
  return acc;
}, []);

export const allTracks: Track[] = allPlaylists.flatMap((p) => p.tracks);

export function findTrack(trackId: string | null | undefined): Track | undefined {
  if (!trackId) return undefined;
  return allTracks.find((t) => t.id === trackId);
}

export function findParentPlaylistId(trackId: string): string {
  return allPlaylists.find((p) => p.tracks.some((t) => t.id === trackId))?.id ?? featuredPlaylist.id;
}

function matchesKeyword(track: Track, keyword: string): boolean {
  const haystack = [
    track.title,
    track.subtitle,
    track.details,
    ...track.credits.flatMap((c) => [c.item, c.role]),
  ]
    .join(' ')
    .toLowerCase();
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}`).test(haystack);
}

/** Builds the Spotify-style "This Is <Artist>" playlist for a technology avatar. */
export function buildTechPlaylist(techId: string): Playlist | undefined {
  const tech = technologyAvatars.find((t) => t.id === techId);
  if (!tech) return undefined;
  const tracks = allTracks.filter((track) => tech.keywords.some((k) => matchesKeyword(track, k)));
  return {
    id: `${TECH_PLAYLIST_PREFIX}${tech.id}`,
    title: `This Is ${tech.name}`,
    description: `Every project, role and credential where ${candidateProfile.firstName} ships with ${tech.name}. ${tech.subtitle}.`,
    subtitle: `Playlist • ${tracks.length} items`,
    aboutLabel: 'About',
    artKind: 'note',
    coverColor: tech.color,
    coverImage: tech.image,
    trackCount: tracks.length,
    tracks,
  };
}

/**
 * Resolves any playlist id the UI can show, including the two virtual kinds:
 * the bookmark-driven Recruiter Mix and generated "This Is <tech>" playlists.
 */
export function resolvePlaylist(playlistId: string, recruiterMix: string[]): Playlist {
  if (playlistId === RECRUITER_MIX_ID) {
    const base = allPlaylists.find((p) => p.id === RECRUITER_MIX_ID)!;
    // Keep the order in which the visitor saved items, like Liked Songs.
    const tracks = recruiterMix
      .map((id) => findTrack(id))
      .filter((t): t is Track => Boolean(t));
    return { ...base, tracks, trackCount: tracks.length };
  }
  if (playlistId.startsWith(TECH_PLAYLIST_PREFIX)) {
    const tech = buildTechPlaylist(playlistId.slice(TECH_PLAYLIST_PREFIX.length));
    if (tech) return tech;
  }
  return allPlaylists.find((p) => p.id === playlistId) ?? featuredPlaylist;
}

/** "8 items, about 4 min" — mirrors Spotify's "N songs, about X hr Y min". */
export function formatPlaylistLength(count: number): string {
  const items = `${count} ${count === 1 ? 'item' : 'items'}`;
  if (count === 0) return items;
  const minutes = Math.max(1, Math.round((count * TRACK_DURATION_SECONDS) / 60));
  return `${items}, about ${minutes} min`;
}

export function shuffleIds(ids: string[], firstId?: string): string[] {
  const rest = ids.filter((id) => id !== firstId);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return firstId && ids.includes(firstId) ? [firstId, ...rest] : rest;
}
