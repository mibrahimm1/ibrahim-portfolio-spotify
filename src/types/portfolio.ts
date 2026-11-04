export interface CandidateProfile {
  name: string;
  shortName: string;
  role: string;
  tagline: string;
  gpa: string;
  locations: string[];
  phone: string;
  phoneDisplay: string;
  email: string;
  github: string;
  linkedin: string;
  bio: string;
  calendarBookingUrl: string;
}

export interface TechnologyAvatar {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  category: string;
  monogram: string; // Artwork lettering in place of an artist photo
  keywords: string[]; // Lower-case terms used to build the "This Is <tech>" playlist
}

export interface TrackCredit {
  item: string;
  role: string;
}

export interface Track {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  playlistId: string;
  album: string;
  dateAdded: string;
  duration: string; // Used for domain tag / CGPA / impact
  hook: string; // Lyrics preview headline metric
  details: string; // About the Project/Role detailed narrative
  credits: TrackCredit[];
  externalUrl?: string; // GitHub, DOI, or Credential URL
  demoUrl?: string; // Live demo URL
  coverColor: string;
  statusBadge?: string;
  recommenderId?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  subtitle: string;
  coverColor: string;
  trackCount: number;
  tracks: Track[];
  isPinned?: boolean;
}

export interface EndorsedCompetency {
  name: string;
  color: string;
}

export interface Recommender {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  email: string;
  ranking: string;
  type: 'academic' | 'industry';
  avatarInitials: string;
  externalUrl: string;
  externalLabel: string;
  linkedTrackId: string;
  linkedTrackName: string;
  competencies: EndorsedCompetency[];
  fullLetter: string[];
  facultyProfileUrl?: string;
}

export type AccentThemeId = 'green' | 'purple' | 'orange' | 'crimson' | 'blue';

export interface AccentTheme {
  id: AccentThemeId;
  name: string;
  primary: string;
  hover: string;
  pressed: string;
  gradient: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedTrackId?: string;
  suggestedTrackTitle?: string;
}

export interface StarterPrompt {
  id: string;
  question: string;
  subtitle: string;
  initialResponse: string;
  referencedTrackId?: string;
}

export type ActiveViewType =
  | 'home'
  | 'playlist'
  | 'recommender'
  | 'lyrics'
  | 'recruiter-mix'
  | 'browse';

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

export interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}
