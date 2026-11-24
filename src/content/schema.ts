import { z } from 'zod';

/**
 * The single contract for `content/portfolio.json`.
 *
 * Every value that reaches the page comes through this schema, so it is also the first
 * security boundary: links can only use safe schemes, images can only point at files under
 * /uploads, colours must be hex, ids must be slugs, and every cross-reference must resolve.
 * An invalid file fails `next build` (the loader parses at import time) and `npm run content:validate`.
 */

export const SCHEMA_VERSION = 1;

/** Ids the app reserves for virtual playlists; stored content may not use them. */
export const RESERVED_PLAYLIST_IDS = ['recruiter-mix'] as const;

export const ART_KINDS = ['code', 'work', 'education', 'document', 'people', 'trophy', 'heart', 'note', 'star', 'mic'] as const;

const text = (max: number) => z.string().trim().min(1, 'Required').max(max, `Keep this under ${max} characters`);
const optionalText = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`).optional();

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens (e.g. my-project)')
  .max(64);

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour like #1ed760');

/** Absolute http(s) URL, or mailto:/tel:. Blocks javascript:, data:, vbscript: and friends. */
export const safeUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (/[\s<>"'`]/.test(value)) return false;
    if (/^(mailto|tel):[^\s]+$/i.test(value)) return true;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }, 'Use a full https:// link (or mailto: / tel:)');

/** A safe external URL or a site-relative path such as /resume. */
const linkHref = z.union([
  safeUrl,
  z.string().regex(/^\/(?!\/)[A-Za-z0-9/_.#-]*$/, 'Use a full https:// link or a site path like /resume'),
]);

/** Images may only be served from /uploads (the dashboard's upload folder). */
const imagePath = z
  .string()
  .regex(/^\/uploads\/[A-Za-z0-9_-]+\.(png|jpe?g|webp|avif)$/i, 'Images must be uploaded files under /uploads/');

const pdfPath = z.string().regex(/^\/(uploads\/)?[A-Za-z0-9_-]+\.pdf$/i, 'Use /resume.pdf or an uploaded /uploads/*.pdf');

const fileName = z.string().regex(/^[A-Za-z0-9_. -]+\.pdf$/, 'A plain file name ending in .pdf');

export const CreditSchema = z.object({
  item: text(80),
  role: text(160),
});

export const TrackSchema = z.object({
  id: slug,
  title: text(200),
  subtitle: text(300),
  album: text(160),
  dateAdded: text(80),
  duration: text(60), // Rendered in the "duration" column: a domain tag, grade or impact
  hook: text(300),
  details: text(4000),
  credits: z.array(CreditSchema).max(20),
  externalUrl: safeUrl.optional(),
  demoUrl: safeUrl.optional(),
  coverColor: hexColor,
  coverImage: imagePath.optional(),
  statusBadge: optionalText(40),
  recommenderId: slug.optional(),
});

export const PlaylistSchema = z.object({
  id: slug,
  title: text(80),
  description: text(400),
  subtitle: text(160),
  aboutLabel: text(40), // Heading of the "About" card in the Now Playing view, e.g. "About the project"
  coverColor: hexColor,
  coverImage: imagePath.optional(),
  artKind: z.enum(ART_KINDS),
  tracks: z.array(TrackSchema).max(100),
});

export const TechnologySchema = z.object({
  id: slug,
  name: text(60),
  subtitle: text(160),
  category: text(60),
  monogram: text(4),
  color: hexColor,
  image: imagePath.optional(),
  keywords: z.array(text(40)).min(1, 'Add at least one keyword').max(20),
});

export const RecommenderSchema = z.object({
  id: slug,
  name: text(100),
  title: text(200),
  affiliation: text(300),
  email: z.email().optional(),
  ranking: text(160),
  type: z.enum(['academic', 'industry']),
  avatarInitials: text(3),
  photo: imagePath.optional(),
  externalUrl: safeUrl,
  externalLabel: text(80),
  facultyProfileUrl: safeUrl.optional(),
  facultyProfileLabel: text(60).optional(), // Button text for facultyProfileUrl; defaults to "Faculty profile"
  quote: text(240).optional(), // Short pull quote for the portfolio page; defaults to the letter's first sentence
  linkedTrackId: slug,
  competencies: z.array(z.object({ name: text(80), color: hexColor })).max(20),
  fullLetter: z.array(text(3000)).min(1).max(20),
});

export const StarterPromptSchema = z.object({
  id: slug,
  question: text(160),
  subtitle: text(120),
  initialResponse: text(2000),
  referencedTrackId: slug.optional(),
});

export const AiIntentSchema = z.object({
  id: slug,
  keywords: z.array(text(40)).min(1).max(30),
  answer: text(2000),
  trackId: slug.optional(),
});

export const AccentThemeSchema = z.object({
  id: slug,
  name: text(60),
  primary: hexColor,
  hover: hexColor,
  pressed: hexColor,
  banner: hexColor, // Profile header colour; the page fades it into #121212
});

export const ProfileSchema = z.object({
  name: text(100),
  firstName: text(40), // Used in copy such as "Ask Ibrahim's AI"
  shortName: text(40),
  initials: text(4),
  avatarLetter: text(2),
  avatarImage: imagePath.optional(),
  role: text(100),
  tagline: text(240),
  verifiedLabel: text(40),
  availabilityLine: text(120),
  locationChip: text(60),
  gpa: optionalText(40),
  locations: z.array(text(80)).max(10),
  phone: text(40),
  phoneDisplay: text(40),
  email: z.email(),
  github: safeUrl,
  linkedin: safeUrl,
  bio: text(2000),
  calendarBookingUrl: safeUrl,
  resumePdf: pdfPath,
  resumeFileName: fileName,
});

export const SiteSchema = z.object({
  title: text(120),
  description: text(320),
  keywords: z.array(text(40)).max(30),
  author: text(100),
  themeColor: hexColor,
});

export const HomeSchema = z.object({
  /** Playlist the profile Play button, "Top tracks" and empty states point at. */
  featuredPlaylistId: slug,
  topArtistsTitle: text(60),
  topArtistsSubtitle: text(120),
  topTracksTitle: text(60),
  topTracksSubtitle: text(120),
  topTracksCount: z.number().int().min(1).max(10),
  followingTitle: text(60),
  followingSubtitle: text(120),
});

export const ResumeSectionSchema = z.object({
  heading: text(80),
  playlistId: slug,
  variant: z.enum(['experience', 'projects', 'education', 'publication', 'bullets']),
  limit: z.number().int().min(1).max(50).optional(),
});

export const ResumeSchema = z.object({
  locationLine: text(160),
  skills: z.array(z.object({ label: text(60), value: text(300) })).max(12),
  sections: z.array(ResumeSectionSchema).max(10),
  recommendationsHeading: text(80),
});

/** True for an IANA time zone this runtime knows, e.g. "Asia/Karachi". */
export function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** The standard portfolio page at /resume. Every field is optional and has a default. */
export const LandingSchema = z.object({
  heroPrefix: text(40).optional(), // "I build"
  rotatingPhrases: z.array(text(40)).min(1).max(6).optional(), // "multi-agent systems", …
  heroSuffix: optionalText(60), // e.g. "for real users."
  featuredProjectIds: z.array(slug).max(6).optional(), // Poster cards; the rest of the playlist becomes the list
  projectsPlaylistId: slug.optional(), // Defaults to home.featuredPlaylistId
  timeZone: z.string().trim().max(60).refine(isTimeZone, 'Use an IANA time zone such as Asia/Karachi').optional(),
  contactHeading: text(80).optional(),
  contactLine: text(200).optional(),
});

export const FooterSchema = z.object({
  columns: z
    .array(
      z.object({
        title: text(40),
        links: z.array(z.object({ label: text(40), href: linkHref, download: z.boolean().optional() })).max(10),
      })
    )
    .max(6),
});

export const PortfolioSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    site: SiteSchema,
    profile: ProfileSchema,
    home: HomeSchema,
    recruiterMix: z.object({ title: text(60), description: text(300), subtitle: text(120) }),
    technologies: z.array(TechnologySchema).max(24),
    playlists: z.array(PlaylistSchema).min(1, 'Add at least one playlist').max(20),
    recommenders: z.array(RecommenderSchema).max(20),
    starterPrompts: z.array(StarterPromptSchema).max(10),
    ai: z.object({ intents: z.array(AiIntentSchema).max(50), defaultAnswer: text(2000) }),
    accentThemes: z.array(AccentThemeSchema).min(1, 'Keep at least one accent theme').max(10),
    coverLetterStanzas: z.array(text(1500)).min(1).max(20),
    whatsNew: z.array(slug).max(10),
    resume: ResumeSchema,
    landing: LandingSchema.optional(),
    footer: FooterSchema,
  })
  .superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });

    const dupes = (ids: string[], path: (string | number)[], label: string) => {
      const seen = new Set<string>();
      ids.forEach((id, i) => {
        if (seen.has(id)) issue([...path, i, 'id'], `Duplicate ${label} id "${id}"`);
        seen.add(id);
      });
    };

    const trackIds = new Set<string>();
    data.playlists.forEach((p, pi) => {
      if ((RESERVED_PLAYLIST_IDS as readonly string[]).includes(p.id)) {
        issue(['playlists', pi, 'id'], `"${p.id}" is reserved for the built-in Recruiter Mix`);
      }
      p.tracks.forEach((t, ti) => {
        if (trackIds.has(t.id)) issue(['playlists', pi, 'tracks', ti, 'id'], `Duplicate track id "${t.id}"`);
        trackIds.add(t.id);
      });
    });
    dupes(data.playlists.map((p) => p.id), ['playlists'], 'playlist');
    dupes(data.technologies.map((t) => t.id), ['technologies'], 'technology');
    dupes(data.recommenders.map((r) => r.id), ['recommenders'], 'recommender');
    dupes(data.starterPrompts.map((s) => s.id), ['starterPrompts'], 'prompt');
    dupes(data.ai.intents.map((s) => s.id), ['ai', 'intents'], 'intent');
    dupes(data.accentThemes.map((s) => s.id), ['accentThemes'], 'theme');

    const playlistIds = new Set(data.playlists.map((p) => p.id));
    const recommenderIds = new Set(data.recommenders.map((r) => r.id));
    const needTrack = (id: string | undefined, path: (string | number)[]) => {
      if (id && !trackIds.has(id)) issue(path, `No track with id "${id}"`);
    };

    data.playlists.forEach((p, pi) =>
      p.tracks.forEach((t, ti) => {
        if (t.recommenderId && !recommenderIds.has(t.recommenderId)) {
          issue(['playlists', pi, 'tracks', ti, 'recommenderId'], `No recommender with id "${t.recommenderId}"`);
        }
      })
    );
    data.recommenders.forEach((r, i) => needTrack(r.linkedTrackId, ['recommenders', i, 'linkedTrackId']));
    data.starterPrompts.forEach((s, i) => needTrack(s.referencedTrackId, ['starterPrompts', i, 'referencedTrackId']));
    data.ai.intents.forEach((s, i) => needTrack(s.trackId, ['ai', 'intents', i, 'trackId']));
    data.whatsNew.forEach((id, i) => needTrack(id, ['whatsNew', i]));

    const featured = data.playlists.find((p) => p.id === data.home.featuredPlaylistId);
    if (!featured) issue(['home', 'featuredPlaylistId'], `No playlist with id "${data.home.featuredPlaylistId}"`);
    else if (featured.tracks.length === 0) issue(['home', 'featuredPlaylistId'], 'The featured playlist needs at least one track');

    data.resume.sections.forEach((s, i) => {
      if (!playlistIds.has(s.playlistId)) issue(['resume', 'sections', i, 'playlistId'], `No playlist with id "${s.playlistId}"`);
    });

    const landing = data.landing;
    if (landing?.projectsPlaylistId && !playlistIds.has(landing.projectsPlaylistId)) {
      issue(['landing', 'projectsPlaylistId'], `No playlist with id "${landing.projectsPlaylistId}"`);
    }
    landing?.featuredProjectIds?.forEach((id, i) => needTrack(id, ['landing', 'featuredProjectIds', i]));
  });

export type PortfolioContent = z.infer<typeof PortfolioSchema>;
export type StoredTrack = z.infer<typeof TrackSchema>;
export type StoredPlaylist = z.infer<typeof PlaylistSchema>;
export type ArtKind = (typeof ART_KINDS)[number];

/** Human-readable list of problems, used by the build error and the dashboard. */
export function formatContentErrors(error: z.ZodError): string {
  return error.issues.map((i) => `• ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
}
