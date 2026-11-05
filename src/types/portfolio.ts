import type { z } from 'zod';
import type {
  AccentThemeSchema,
  ProfileSchema,
  RecommenderSchema,
  StarterPromptSchema,
  StoredPlaylist,
  StoredTrack,
  TechnologySchema,
} from '@/content/schema';

// Content types are derived from the zod schema in src/content/schema.ts, so the
// editable JSON, the dashboard and the UI can never drift apart.

export type CandidateProfile = z.infer<typeof ProfileSchema>;
export type TechnologyAvatar = z.infer<typeof TechnologySchema>;
export type Recommender = z.infer<typeof RecommenderSchema>;
export type StarterPrompt = z.infer<typeof StarterPromptSchema>;
export type EndorsedCompetency = Recommender['competencies'][number];
export type TrackCredit = StoredTrack['credits'][number];

/** A stored track plus the fields the loader derives from its position. */
export type Track = StoredTrack & {
  playlistId: string;
  number: number; // 1-based position inside its playlist
};

export type Playlist = Omit<StoredPlaylist, 'tracks'> & {
  tracks: Track[];
  trackCount: number;
  isPinned?: boolean;
};

export type AccentThemeId = string;

export type AccentTheme = z.infer<typeof AccentThemeSchema> & {
  gradient: string; // Derived from `banner`; kept for the --banner-gradient variable
};

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedTrackId?: string;
  suggestedTrackTitle?: string;
}

export type ActiveViewType =
  | 'home'
  | 'playlist'
  | 'recommender'
  | 'lyrics'
  | 'recruiter-mix'
  | 'browse'
  | 'library'
  | 'contact';

/** Bottom tab on phones (Spotify's Home / Search / Your Library / Premium slot). */
export type MobileTab = 'home' | 'search' | 'library' | 'contact';

export type RepeatMode = 'off' | 'context' | 'track';

export type TrackListDensity = 'list' | 'compact';

export interface ContextMenuItem {
  id: string;
  label: string;
  onSelect: () => void;
  external?: boolean;
  checked?: boolean;
  dividerBefore?: boolean;
}

export interface ContextMenuHeader {
  title: string;
  subtitle?: string;
  color?: string;
  image?: string;
  kind?: import('@/content/schema').ArtKind;
  isRecruiterMix?: boolean;
}

export interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
  /** Shown at the top of the phone bottom sheet (artwork, title, subtitle). */
  header?: ContextMenuHeader;
}
