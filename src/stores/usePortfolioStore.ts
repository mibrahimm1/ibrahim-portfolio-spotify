import { create } from 'zustand';
import {
  Track,
  Playlist,
  AccentThemeId,
  ActiveViewType,
  ChatMessage,
  ContextMenuState,
  RepeatMode,
  TrackListDensity,
} from '@/types/portfolio';
import { allPlaylists, featuredProjectsTracks, accentThemes } from '@/data/portfolioData';
import {
  allTracks,
  findParentPlaylistId,
  findTrack,
  resolvePlaylist,
  shuffleIds,
  RECRUITER_MIX_ID,
  TRACK_DURATION_SECONDS,
  LYRICS_DURATION_SECONDS,
} from '@/lib/catalog';
import { processAIQuery } from '@/lib/aiEngine';
import { ViewEntry, isSameEntry } from '@/lib/routing';

type NavigationHistoryEntry = ViewEntry;
export type RightSidebarMode = 'inspector' | 'activity' | 'queue';

const STORAGE_KEYS = {
  mix: 'ibrahim_recruiter_mix',
  theme: 'ibrahim_accent_theme',
  prefs: 'ibrahim_player_prefs',
} as const;

export const LEFT_SIDEBAR = { collapsed: 72, min: 280, max: 420, default: 340 } as const;
export const RIGHT_SIDEBAR = { min: 280, max: 420, default: 360 } as const;

export interface PortfolioState {
  // Playback state (audio-less timer)
  currentTrack: Track;
  currentPlaylist: Playlist; // Context the current track was started from
  playContextId: string;
  isPlaying: boolean;
  progress: number; // 0 to 100 percentage
  currentTimeSeconds: number;
  durationSeconds: number;
  shuffle: boolean;
  shuffleOrder: string[];
  repeat: RepeatMode;
  volume: number; // 0-100, purely visual (CON-02: no audio)
  isMuted: boolean;

  // Active Accent Theme
  activeAccentTheme: AccentThemeId;

  // Recruiter Mix Bookmarks
  recruiterMix: string[]; // Track IDs, in the order they were saved

  // Navigation & Center Stage View
  activeView: ActiveViewType;
  activePlaylistId: string;
  activeRecommenderId: string | null;
  history: NavigationHistoryEntry[];
  historyIndex: number;
  selectedTrackId: string | null;

  // Layout & Overlays
  isRightSidebarOpen: boolean;
  rightSidebarMode: RightSidebarMode;
  isLibraryCollapsed: boolean;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  trackListDensity: TrackListDensity;
  isSearchOpen: boolean;
  searchQuery: string;
  chatMessages: ChatMessage[];
  isBookingModalOpen: boolean;
  isThemeModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  contextMenu: ContextMenuState | null;
  toastMessage: string | null;
  toastId: number;

  // Actions
  setCurrentTrack: (track: Track, autoPlay?: boolean, contextId?: string) => void;
  playTrackInContext: (track: Track, contextId: string) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setProgress: (progress: number) => void;
  tickProgress: (deltaSeconds: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleBookmark: (trackId: string) => void;
  isBookmarked: (trackId: string) => boolean;
  setAccentTheme: (themeId: AccentThemeId) => void;
  getQueue: () => Track[];

  // Navigation actions
  navigateHome: () => void;
  navigateToPlaylist: (playlistId: string) => void;
  navigateToRecommender: (recommenderId: string) => void;
  navigateToLyrics: () => void;
  toggleLyrics: () => void;
  navigateToRecruiterMix: () => void;
  navigateToBrowse: () => void;
  navigateBack: () => void;
  navigateForward: () => void;
  restoreView: (entry: NavigationHistoryEntry) => void;
  selectTrack: (trackId: string | null) => void;

  // Sidebars & Overlays
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (isOpen: boolean) => void;
  toggleRightSidebarMode: () => void;
  setRightSidebarMode: (mode: RightSidebarMode) => void;
  openTrackDetails: (track: Track) => void;
  toggleLibraryCollapse: () => void;
  setLeftSidebarWidth: (width: number) => void;
  setRightSidebarWidth: (width: number) => void;
  setTrackListDensity: (density: TrackListDensity) => void;
  setSearchOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  askAI: (question: string) => void;
  clearChat: () => void;
  setBookingModalOpen: (isOpen: boolean) => void;
  setThemeModalOpen: (isOpen: boolean) => void;
  setShortcutsModalOpen: (isOpen: boolean) => void;
  openContextMenu: (menu: ContextMenuState) => void;
  closeContextMenu: () => void;
  closeTopmostOverlay: () => boolean;
  showToast: (msg: string) => void;
  hideToast: () => void;

  // Transport
  nextTrack: (auto?: boolean) => void;
  prevTrack: () => void;

  // Hydration
  hydrateFromStorage: () => void;
}

function applyThemeVariables(themeId: string) {
  if (typeof document === 'undefined') return;
  const theme = accentThemes[themeId] || accentThemes.green;
  const root = document.documentElement.style;
  root.setProperty('--accent-primary', theme.primary);
  root.setProperty('--accent-hover', theme.hover);
  root.setProperty('--accent-pressed', theme.pressed);
  root.setProperty('--banner-gradient', theme.gradient);
  root.setProperty('--banner-color', theme.gradient.match(/#[0-9a-f]{6}/i)?.[0] ?? '#117735');
}

/** The cover letter "plays" long enough to read; regular tracks run the 30s highlight timer. */
function timingFor(view: ActiveViewType, progress: number) {
  const durationSeconds = view === 'lyrics' ? LYRICS_DURATION_SECONDS : TRACK_DURATION_SECONDS;
  return { durationSeconds, currentTimeSeconds: Math.round((progress / 100) * durationSeconds) };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Track order for the active context, honouring shuffle (and new/removed mix items). */
function contextOrder(state: PortfolioState): string[] {
  const contextTracks = resolvePlaylist(state.playContextId, state.recruiterMix).tracks;
  const ids = (contextTracks.length > 0 ? contextTracks : allTracks).map((t) => t.id);
  if (!state.shuffle) return ids;
  const kept = state.shuffleOrder.filter((id) => ids.includes(id));
  return [...kept, ...ids.filter((id) => !kept.includes(id))];
}

/**
 * Upcoming tracks after the current one. Pure, so it can be used inside a
 * `useShallow` selector (track objects are stable references from the dataset).
 */
export function computeQueue(state: PortfolioState): Track[] {
  const order = contextOrder(state);
  const idx = order.indexOf(state.currentTrack.id);
  const after = idx === -1 ? order : order.slice(idx + 1);
  const wrapped = state.repeat === 'context' && idx > 0 ? order.slice(0, idx) : [];
  return [...after, ...wrapped].map((id) => findTrack(id)).filter((t): t is Track => Boolean(t));
}

let toastCounter = 0;

export const usePortfolioStore = create<PortfolioState>((set, get) => {
  const persistPrefs = () => {
    if (typeof window === 'undefined') return;
    const s = get();
    try {
      localStorage.setItem(
        STORAGE_KEYS.prefs,
        JSON.stringify({
          shuffle: s.shuffle,
          repeat: s.repeat,
          volume: s.volume,
          isMuted: s.isMuted,
          isLibraryCollapsed: s.isLibraryCollapsed,
          leftSidebarWidth: s.leftSidebarWidth,
          rightSidebarWidth: s.rightSidebarWidth,
          isRightSidebarOpen: s.isRightSidebarOpen,
          trackListDensity: s.trackListDensity,
        })
      );
    } catch {
      // Storage can be unavailable (private mode, quota); prefs are a convenience only.
    }
  };

  // Spotify doesn't add a history entry when you click the view you're already on.
  const pushEntry = (entry: NavigationHistoryEntry, extra: Partial<PortfolioState> = {}) => {
    set((state) => {
      const base = {
        activeView: entry.view,
        activePlaylistId: entry.playlistId ?? state.activePlaylistId,
        activeRecommenderId: entry.recommenderId ?? null,
        selectedTrackId: null,
        ...(entry.view !== state.activeView ? timingFor(entry.view, state.progress) : {}),
        ...extra,
      };
      if (isSameEntry(state.history[state.historyIndex], entry)) return base;
      const nextHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        ...base,
        history: [...nextHistory, entry],
        historyIndex: nextHistory.length,
      };
    });
  };

  const applyEntry = (entry: NavigationHistoryEntry, historyIndex: number) => {
    set((state) => ({
      historyIndex,
      activeView: entry.view,
      activePlaylistId: entry.playlistId ?? state.activePlaylistId,
      activeRecommenderId: entry.recommenderId ?? null,
      selectedTrackId: null,
      ...(entry.view !== state.activeView ? timingFor(entry.view, state.progress) : {}),
    }));
  };

  return {
    currentTrack: featuredProjectsTracks[0],
    currentPlaylist: allPlaylists[1], // Featured Projects
    playContextId: 'featured-projects',
    isPlaying: false,
    progress: 0,
    currentTimeSeconds: 0,
    durationSeconds: TRACK_DURATION_SECONDS,
    shuffle: false,
    shuffleOrder: [],
    repeat: 'off',
    volume: 75,
    isMuted: false,

    activeAccentTheme: 'green',
    recruiterMix: [],

    activeView: 'home',
    activePlaylistId: 'featured-projects',
    activeRecommenderId: null,
    history: [{ view: 'home' }],
    historyIndex: 0,
    selectedTrackId: null,

    isRightSidebarOpen: true,
    rightSidebarMode: 'inspector',
    isLibraryCollapsed: false,
    leftSidebarWidth: LEFT_SIDEBAR.default,
    rightSidebarWidth: RIGHT_SIDEBAR.default,
    trackListDensity: 'list',
    isSearchOpen: false,
    searchQuery: '',
    chatMessages: [],
    isBookingModalOpen: false,
    isThemeModalOpen: false,
    isShortcutsModalOpen: false,
    contextMenu: null,
    toastMessage: null,
    toastId: 0,

    hydrateFromStorage: () => {
      if (typeof window === 'undefined') return;
      try {
        const savedMix = JSON.parse(localStorage.getItem(STORAGE_KEYS.mix) || '[]');
        const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) as AccentThemeId | null;
        const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.prefs) || '{}');
        const themeId = savedTheme && accentThemes[savedTheme] ? savedTheme : 'green';

        set({
          // Drop ids that no longer exist in the dataset (e.g. after content edits).
          recruiterMix: Array.isArray(savedMix)
            ? savedMix.filter((id): id is string => typeof id === 'string' && !!findTrack(id))
            : [],
          activeAccentTheme: themeId,
          shuffle: typeof prefs.shuffle === 'boolean' ? prefs.shuffle : false,
          repeat: ['off', 'context', 'track'].includes(prefs.repeat) ? prefs.repeat : 'off',
          volume: typeof prefs.volume === 'number' ? clamp(prefs.volume, 0, 100) : 75,
          isMuted: !!prefs.isMuted,
          isLibraryCollapsed: !!prefs.isLibraryCollapsed,
          leftSidebarWidth:
            typeof prefs.leftSidebarWidth === 'number'
              ? clamp(prefs.leftSidebarWidth, LEFT_SIDEBAR.min, LEFT_SIDEBAR.max)
              : LEFT_SIDEBAR.default,
          rightSidebarWidth:
            typeof prefs.rightSidebarWidth === 'number'
              ? clamp(prefs.rightSidebarWidth, RIGHT_SIDEBAR.min, RIGHT_SIDEBAR.max)
              : RIGHT_SIDEBAR.default,
          isRightSidebarOpen:
            typeof prefs.isRightSidebarOpen === 'boolean' ? prefs.isRightSidebarOpen : true,
          trackListDensity: prefs.trackListDensity === 'compact' ? 'compact' : 'list',
        });
        if (get().shuffle) {
          set({ shuffleOrder: shuffleIds(contextOrder({ ...get(), shuffle: false }), get().currentTrack.id) });
        }
        applyThemeVariables(themeId);
      } catch {
        // Corrupt storage: fall back to defaults silently.
      }
    },

    setCurrentTrack: (track, autoPlay = true, contextId) => {
      const state = get();
      const currentContext = resolvePlaylist(state.playContextId, state.recruiterMix);
      // Keep playing inside the current context when possible (Spotify keeps the
      // queue you started from), otherwise fall back to the track's own playlist.
      const nextContextId =
        contextId ??
        (currentContext.tracks.some((t) => t.id === track.id)
          ? state.playContextId
          : findParentPlaylistId(track.id));
      const nextContext = resolvePlaylist(nextContextId, state.recruiterMix);
      const contextChanged = nextContextId !== state.playContextId;

      set({
        currentTrack: track,
        currentPlaylist: nextContext,
        playContextId: nextContextId,
        currentTimeSeconds: 0,
        progress: 0,
        isPlaying: autoPlay ? true : state.isPlaying,
        rightSidebarMode: 'inspector',
        shuffleOrder:
          state.shuffle && (contextChanged || state.shuffleOrder.length === 0)
            ? shuffleIds(nextContext.tracks.map((t) => t.id), track.id)
            : state.shuffleOrder,
      });
    },

    playTrackInContext: (track, contextId) => {
      get().setCurrentTrack(track, true, contextId);
    },

    togglePlay: () => {
      set((state) => ({ isPlaying: !state.isPlaying }));
    },

    setPlaying: (isPlaying) => {
      set({ isPlaying });
    },

    setProgress: (progress) => {
      const duration = get().durationSeconds;
      const safe = clamp(progress, 0, 100);
      const current = (safe / 100) * duration;
      set({ progress: safe, currentTimeSeconds: Math.round(current) });
    },

    tickProgress: (deltaSeconds) => {
      const { isPlaying, currentTimeSeconds, durationSeconds } = get();
      if (!isPlaying) return;

      const nextTime = currentTimeSeconds + deltaSeconds;
      if (nextTime >= durationSeconds) {
        get().nextTrack(true);
      } else {
        set({
          currentTimeSeconds: nextTime,
          progress: (nextTime / durationSeconds) * 100,
        });
      }
    },

    toggleShuffle: () => {
      const state = get();
      const shuffle = !state.shuffle;
      set({
        shuffle,
        shuffleOrder: shuffle ? shuffleIds(contextOrder({ ...state, shuffle: false }), state.currentTrack.id) : [],
      });
      persistPrefs();
    },

    cycleRepeat: () => {
      const order: RepeatMode[] = ['off', 'context', 'track'];
      set((state) => ({ repeat: order[(order.indexOf(state.repeat) + 1) % order.length] }));
      persistPrefs();
    },

    setVolume: (volume) => {
      const v = clamp(Math.round(volume), 0, 100);
      set({ volume: v, isMuted: v === 0 });
      persistPrefs();
    },

    toggleMute: () => {
      set((state) => ({
        isMuted: !state.isMuted,
        volume: state.isMuted && state.volume === 0 ? 50 : state.volume,
      }));
      persistPrefs();
    },

    toggleBookmark: (trackId) => {
      const { recruiterMix, showToast } = get();
      const exists = recruiterMix.includes(trackId);
      const nextMix = exists ? recruiterMix.filter((id) => id !== trackId) : [...recruiterMix, trackId];

      showToast(exists ? 'Removed from Your Recruiter Mix' : 'Added to Your Recruiter Mix');
      set({ recruiterMix: nextMix });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.mix, JSON.stringify(nextMix));
        } catch {}
      }
    },

    isBookmarked: (trackId) => {
      return get().recruiterMix.includes(trackId);
    },

    setAccentTheme: (themeId) => {
      const theme = accentThemes[themeId];
      if (!theme) return;

      set({ activeAccentTheme: themeId });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.theme, themeId);
        } catch {}
        applyThemeVariables(themeId);
      }
    },

    getQueue: () => computeQueue(get()),

    navigateHome: () => pushEntry({ view: 'home' }),

    navigateToPlaylist: (playlistId) => {
      if (playlistId === RECRUITER_MIX_ID) {
        get().navigateToRecruiterMix();
        return;
      }
      pushEntry({ view: 'playlist', playlistId });
    },

    navigateToRecommender: (recommenderId) => pushEntry({ view: 'recommender', recommenderId }),

    navigateToLyrics: () => pushEntry({ view: 'lyrics' }),

    toggleLyrics: () => {
      const { activeView, historyIndex, navigateBack, navigateHome, navigateToLyrics } = get();
      if (activeView !== 'lyrics') {
        navigateToLyrics();
      } else if (historyIndex > 0) {
        navigateBack();
      } else {
        navigateHome();
      }
    },

    navigateToRecruiterMix: () => pushEntry({ view: 'recruiter-mix', playlistId: RECRUITER_MIX_ID }),

    navigateToBrowse: () => pushEntry({ view: 'browse' }),

    navigateBack: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) applyEntry(history[historyIndex - 1], historyIndex - 1);
    },

    navigateForward: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) applyEntry(history[historyIndex + 1], historyIndex + 1);
    },

    restoreView: (entry) => {
      // Deep link: keep Home behind the restored view so "Back" still works.
      const history: NavigationHistoryEntry[] = entry.view === 'home' ? [entry] : [{ view: 'home' }, entry];
      set({ history });
      applyEntry(entry, history.length - 1);
    },

    selectTrack: (trackId) => set({ selectedTrackId: trackId }),

    toggleRightSidebar: () => {
      set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen }));
      persistPrefs();
    },

    setRightSidebarOpen: (isOpen) => {
      set({ isRightSidebarOpen: isOpen });
      persistPrefs();
    },

    toggleRightSidebarMode: () => {
      set((state) => ({
        rightSidebarMode: state.rightSidebarMode === 'inspector' ? 'activity' : 'inspector',
        // Switching panels while the sidebar is hidden would otherwise do nothing visible.
        isRightSidebarOpen: true,
      }));
      persistPrefs();
    },

    setRightSidebarMode: (mode) => {
      set({ rightSidebarMode: mode });
    },

    openTrackDetails: (track) => {
      get().setCurrentTrack(track, get().isPlaying);
      set({ rightSidebarMode: 'inspector', isRightSidebarOpen: true });
      persistPrefs();
    },

    toggleLibraryCollapse: () => {
      set((state) => ({ isLibraryCollapsed: !state.isLibraryCollapsed }));
      persistPrefs();
    },

    setLeftSidebarWidth: (width) => {
      // Dragging below the minimum snaps the library into its collapsed icon rail.
      if (width < LEFT_SIDEBAR.min - 60) {
        set({ isLibraryCollapsed: true });
      } else {
        set({ isLibraryCollapsed: false, leftSidebarWidth: clamp(width, LEFT_SIDEBAR.min, LEFT_SIDEBAR.max) });
      }
      persistPrefs();
    },

    setRightSidebarWidth: (width) => {
      set({ rightSidebarWidth: clamp(width, RIGHT_SIDEBAR.min, RIGHT_SIDEBAR.max) });
      persistPrefs();
    },

    setTrackListDensity: (density) => {
      set({ trackListDensity: density });
      persistPrefs();
    },

    setSearchOpen: (isOpen) => {
      set({ isSearchOpen: isOpen });
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    askAI: (question) => {
      const content = question.trim();
      if (!content) return;
      const aiRes = processAIQuery(content);
      const stamp = Date.now();
      const userMsg: ChatMessage = {
        id: `user-${stamp}`,
        sender: 'user',
        content,
        timestamp: 'Just now',
      };
      const aiMsg: ChatMessage = {
        id: `ai-${stamp + 1}`,
        sender: 'assistant',
        content: aiRes.answer,
        timestamp: 'Just now',
        suggestedTrackId: aiRes.referencedTrack?.id,
        suggestedTrackTitle: aiRes.referencedTrack?.title,
      };
      set((state) => ({
        chatMessages: [...state.chatMessages, userMsg, aiMsg],
        searchQuery: '',
        isSearchOpen: true,
      }));
    },

    clearChat: () => set({ chatMessages: [] }),

    setBookingModalOpen: (isOpen) => {
      set({ isBookingModalOpen: isOpen });
    },

    setThemeModalOpen: (isOpen) => {
      set({ isThemeModalOpen: isOpen });
    },

    setShortcutsModalOpen: (isOpen) => {
      set({ isShortcutsModalOpen: isOpen });
    },

    openContextMenu: (menu) => set({ contextMenu: menu }),

    closeContextMenu: () => set({ contextMenu: null }),

    // Escape closes one layer at a time, innermost first (NFR-A11Y-02).
    closeTopmostOverlay: () => {
      const s = get();
      if (s.contextMenu) set({ contextMenu: null });
      else if (s.isShortcutsModalOpen) set({ isShortcutsModalOpen: false });
      else if (s.isThemeModalOpen) set({ isThemeModalOpen: false });
      else if (s.isBookingModalOpen) set({ isBookingModalOpen: false });
      else if (s.isSearchOpen) set({ isSearchOpen: false });
      else if (s.activeView === 'lyrics') s.toggleLyrics();
      else return false;
      return true;
    },

    showToast: (msg) => {
      const id = ++toastCounter;
      set({ toastMessage: msg, toastId: id });
      setTimeout(() => {
        // Compare ids, not text: a repeated identical toast must get its full duration.
        if (get().toastId === id) set({ toastMessage: null });
      }, 3000);
    },

    hideToast: () => {
      set({ toastMessage: null });
    },

    nextTrack: (auto = false) => {
      const state = get();
      if (auto && state.repeat === 'track') {
        set({ currentTimeSeconds: 0, progress: 0 });
        return;
      }
      const order = contextOrder(state);
      const idx = order.indexOf(state.currentTrack.id);
      const atEnd = idx >= order.length - 1;
      const nextId = atEnd ? order[0] : order[idx + 1];
      const next = findTrack(nextId) ?? state.currentTrack;
      get().setCurrentTrack(next, true, state.playContextId);
      // With repeat off, Spotify rewinds to the top of the context and stops.
      if (auto && atEnd && state.repeat === 'off') set({ isPlaying: false });
    },

    prevTrack: () => {
      const state = get();
      // Spotify restarts the current track if more than ~3s have played.
      if (state.currentTimeSeconds > 3) {
        set({ currentTimeSeconds: 0, progress: 0 });
        return;
      }
      const order = contextOrder(state);
      const idx = order.indexOf(state.currentTrack.id);
      const prevId = order[(idx - 1 + order.length) % order.length];
      const prev = findTrack(prevId) ?? state.currentTrack;
      get().setCurrentTrack(prev, true, state.playContextId);
    },
  };
});
