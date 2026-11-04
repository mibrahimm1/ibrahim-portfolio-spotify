import { ActiveViewType } from '@/types/portfolio';
import { RECRUITER_MIX_ID } from '@/lib/catalog';

export interface ViewEntry {
  view: ActiveViewType;
  playlistId?: string;
  recommenderId?: string;
}

// Hash routes mirror Spotify's URL scheme (/playlist/:id, /user/:id, /collection/tracks)
// so any view can be bookmarked or shared without a server-side router.
export function entryToHash(entry: ViewEntry): string {
  switch (entry.view) {
    case 'playlist':
      return `#/playlist/${encodeURIComponent(entry.playlistId ?? '')}`;
    case 'recruiter-mix':
      return '#/collection/recruiter-mix';
    case 'recommender':
      return `#/user/${encodeURIComponent(entry.recommenderId ?? '')}`;
    case 'lyrics':
      return '#/lyrics';
    case 'browse':
      return '#/search';
    default:
      return '';
  }
}

export function hashToEntry(hash: string): ViewEntry | null {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [kind, id] = parts;
  if (kind === 'playlist' && id) return { view: 'playlist', playlistId: id };
  if (kind === 'collection') return { view: 'recruiter-mix', playlistId: RECRUITER_MIX_ID };
  if (kind === 'user' && id) return { view: 'recommender', recommenderId: id };
  if (kind === 'lyrics') return { view: 'lyrics' };
  if (kind === 'search') return { view: 'browse' };
  return null;
}

export function isSameEntry(a: ViewEntry | undefined, b: ViewEntry): boolean {
  return (
    !!a &&
    a.view === b.view &&
    (a.playlistId ?? null) === (b.playlistId ?? null) &&
    (a.recommenderId ?? null) === (b.recommenderId ?? null)
  );
}
