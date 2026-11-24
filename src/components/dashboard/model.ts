import type { PortfolioContent } from '@/content/schema';
import type { AIEngineConfig } from '@/lib/aiEngine';

/* ----------------------------- Path helpers ----------------------------- */

export type Path = (string | number)[];

export const pathKey = (path: Path) => path.join('.');

export function getAt(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((node, key) => (node == null ? undefined : (node as Record<string | number, unknown>)[key]), obj);
}

/** Immutable set. Setting `undefined` on an object key deletes it (how optional fields are cleared). */
export function setAt<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const container = (Array.isArray(obj) ? [...obj] : { ...(obj as object) }) as Record<string | number, unknown>;
  const next = setAt(container[head], rest, value);
  if (next === undefined && !Array.isArray(container)) delete container[head];
  else container[head] = next;
  return container as T;
}

export function moveIndex<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return items;
  const copy = [...items];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

/* ------------------------------- Ids ------------------------------------ */

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'item'
  );
}

export function uniqueId(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const root = slugify(base);
  if (!used.has(root)) return root;
  let n = 2;
  while (used.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

export const allTrackIds = (c: PortfolioContent) => c.playlists.flatMap((p) => p.tracks.map((t) => t.id));

/* ---------------------------- References -------------------------------- */

export type RefKind = 'track' | 'playlist' | 'recommender';

export interface Reference {
  label: string;
  path: Path;
  /** Required references can't be cleared automatically; validation flags them until fixed. */
  required: boolean;
}

export function findReferences(c: PortfolioContent, kind: RefKind, id: string): Reference[] {
  const refs: Reference[] = [];
  if (kind === 'track') {
    c.recommenders.forEach((r, i) => {
      if (r.linkedTrackId === id) refs.push({ label: `Recommender “${r.name}” links to it`, path: ['recommenders', i, 'linkedTrackId'], required: true });
    });
    c.starterPrompts.forEach((p, i) => {
      if (p.referencedTrackId === id) refs.push({ label: `Suggested question “${p.question}”`, path: ['starterPrompts', i, 'referencedTrackId'], required: false });
    });
    c.ai.intents.forEach((a, i) => {
      if (a.trackId === id) refs.push({ label: `AI answer “${a.id}”`, path: ['ai', 'intents', i, 'trackId'], required: false });
    });
    c.whatsNew.forEach((w, i) => {
      if (w === id) refs.push({ label: "The What's New menu", path: ['whatsNew', i], required: false });
    });
    c.landing?.featuredProjectIds?.forEach((w, i) => {
      if (w === id) refs.push({ label: 'A poster card on the portfolio page', path: ['landing', 'featuredProjectIds', i], required: false });
    });
  }
  if (kind === 'playlist') {
    if (c.home.featuredPlaylistId === id) refs.push({ label: 'It is the featured playlist on Home', path: ['home', 'featuredPlaylistId'], required: true });
    c.resume.sections.forEach((s, i) => {
      if (s.playlistId === id) refs.push({ label: `Resume section “${s.heading}”`, path: ['resume', 'sections', i], required: false });
    });
    if (c.landing?.projectsPlaylistId === id) {
      refs.push({ label: 'The projects on the portfolio page', path: ['landing', 'projectsPlaylistId'], required: false });
    }
  }
  if (kind === 'recommender') {
    c.playlists.forEach((p, pi) =>
      p.tracks.forEach((t, ti) => {
        if (t.recommenderId === id) refs.push({ label: `“${t.title}” shows their endorsement`, path: ['playlists', pi, 'tracks', ti, 'recommenderId'], required: false });
      })
    );
  }
  return refs;
}

/** Removes every optional reference to `id` (array entries are dropped, optional fields cleared). */
export function cleanReferences(c: PortfolioContent, kind: RefKind, id: string): PortfolioContent {
  const next = structuredClone(c);
  if (kind === 'track') {
    next.starterPrompts.forEach((p) => p.referencedTrackId === id && delete p.referencedTrackId);
    next.ai.intents.forEach((a) => a.trackId === id && delete a.trackId);
    next.whatsNew = next.whatsNew.filter((w) => w !== id);
    if (next.landing?.featuredProjectIds) next.landing.featuredProjectIds = next.landing.featuredProjectIds.filter((w) => w !== id);
  }
  if (kind === 'playlist') {
    next.resume.sections = next.resume.sections.filter((s) => s.playlistId !== id);
    if (next.landing?.projectsPlaylistId === id) delete next.landing.projectsPlaylistId;
  }
  if (kind === 'recommender') next.playlists.forEach((p) => p.tracks.forEach((t) => t.recommenderId === id && delete t.recommenderId));
  return next;
}

/** Points every reference to `from` at `to` (used when an id is renamed). */
export function renameReferences(c: PortfolioContent, kind: RefKind, from: string, to: string): PortfolioContent {
  if (!from || from === to) return c;
  const next = structuredClone(c);
  if (kind === 'track') {
    next.recommenders.forEach((r) => r.linkedTrackId === from && (r.linkedTrackId = to));
    next.starterPrompts.forEach((p) => p.referencedTrackId === from && (p.referencedTrackId = to));
    next.ai.intents.forEach((a) => a.trackId === from && (a.trackId = to));
    next.whatsNew = next.whatsNew.map((w) => (w === from ? to : w));
    if (next.landing?.featuredProjectIds) next.landing.featuredProjectIds = next.landing.featuredProjectIds.map((w) => (w === from ? to : w));
  }
  if (kind === 'playlist') {
    if (next.home.featuredPlaylistId === from) next.home.featuredPlaylistId = to;
    next.resume.sections.forEach((s) => s.playlistId === from && (s.playlistId = to));
    if (next.landing?.projectsPlaylistId === from) next.landing.projectsPlaylistId = to;
  }
  if (kind === 'recommender') next.playlists.forEach((p) => p.tracks.forEach((t) => t.recommenderId === from && (t.recommenderId = to)));
  return next;
}

/** Every uploaded file path the content uses, for the media library's "unused" check. */
export function usedUploads(c: PortfolioContent): Set<string> {
  const used = new Set<string>();
  JSON.stringify(c, (_key, value) => {
    if (typeof value === 'string' && value.startsWith('/uploads/')) used.add(value);
    return value;
  });
  return used;
}

/* ---------------------------- New items --------------------------------- */

const year = () => String(new Date().getFullYear());

export const newItem = {
  track: (c: PortfolioContent) => ({
    id: uniqueId('new-item', allTrackIds(c)),
    title: 'New item',
    subtitle: '',
    album: '',
    dateAdded: year(),
    duration: '',
    hook: '',
    details: '',
    credits: [] as { item: string; role: string }[],
    coverColor: '#649AED',
  }),
  playlist: (c: PortfolioContent) => ({
    id: uniqueId('new-playlist', c.playlists.map((p) => p.id)),
    title: 'New playlist',
    description: '',
    subtitle: 'Playlist',
    aboutLabel: 'About',
    coverColor: '#EB5640',
    artKind: 'note' as const,
    tracks: [],
  }),
  technology: (c: PortfolioContent) => ({
    id: uniqueId('new-technology', c.technologies.map((t) => t.id)),
    name: 'New technology',
    subtitle: '',
    category: '',
    monogram: 'NT',
    color: '#649AED',
    keywords: [] as string[],
  }),
  recommender: (c: PortfolioContent) => ({
    id: uniqueId('new-recommender', c.recommenders.map((r) => r.id)),
    name: '',
    title: '',
    affiliation: '',
    ranking: '',
    type: 'academic' as const,
    avatarInitials: '',
    externalUrl: '',
    externalLabel: 'Open profile',
    linkedTrackId: allTrackIds(c)[0] ?? '',
    competencies: [] as { name: string; color: string }[],
    fullLetter: [''],
  }),
  prompt: (c: PortfolioContent) => ({
    id: uniqueId('prompt', c.starterPrompts.map((p) => p.id)),
    question: '',
    subtitle: '',
    initialResponse: '',
  }),
  intent: (c: PortfolioContent) => ({ id: uniqueId('new-answer', c.ai.intents.map((i) => i.id)), keywords: [] as string[], answer: '' }),
  theme: (c: PortfolioContent) => ({
    id: uniqueId('new-theme', c.accentThemes.map((t) => t.id)),
    name: 'New theme',
    primary: '#1ed760',
    hover: '#3be477',
    pressed: '#1ab752',
    banner: '#117735',
  }),
};

/** The AI engine's config built from a draft, so answers can be tested before saving. */
export function aiConfigFromDraft(c: PortfolioContent): AIEngineConfig {
  return {
    intents: c.ai.intents,
    defaultAnswer: c.ai.defaultAnswer,
    starterPrompts: c.starterPrompts,
    profile: c.profile,
    tracks: c.playlists.flatMap((p) => p.tracks.map((t, i) => ({ ...t, playlistId: p.id, number: i + 1 }))),
  };
}
