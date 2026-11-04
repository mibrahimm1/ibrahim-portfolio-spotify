import { describe, it, expect, beforeEach } from 'vitest';
import { usePortfolioStore, computeQueue } from '@/stores/usePortfolioStore';
import { featuredProjectsTracks, workExperienceTracks } from '@/data/portfolioData';
import { LYRICS_DURATION_SECONDS, TRACK_DURATION_SECONDS } from '@/lib/catalog';

const reset = () =>
  usePortfolioStore.setState({
    currentTrack: featuredProjectsTracks[0],
    playContextId: 'featured-projects',
    isPlaying: false,
    progress: 0,
    currentTimeSeconds: 0,
    durationSeconds: TRACK_DURATION_SECONDS,
    shuffle: false,
    shuffleOrder: [],
    repeat: 'off',
    recruiterMix: [],
    activeView: 'home',
    activePlaylistId: 'featured-projects',
    activeRecommenderId: null,
    history: [{ view: 'home' }],
    historyIndex: 0,
    isRightSidebarOpen: true,
    rightSidebarMode: 'inspector',
    contextMenu: null,
    isSearchOpen: false,
    isBookingModalOpen: false,
    isThemeModalOpen: false,
    isShortcutsModalOpen: false,
    chatMessages: [],
  });

describe('Playback queue, shuffle and repeat', () => {
  beforeEach(reset);

  it('keeps the queue inside the context the track was started from', () => {
    const { toggleBookmark, setCurrentTrack } = usePortfolioStore.getState();
    toggleBookmark('work-bizbuddy');
    toggleBookmark('project-sonyc-rag');
    setCurrentTrack(workExperienceTracks[1], true, 'recruiter-mix');

    const state = usePortfolioStore.getState();
    expect(state.playContextId).toBe('recruiter-mix');
    expect(computeQueue(state).map((t) => t.id)).toEqual(['project-sonyc-rag']);
  });

  it('stops at the end of the context when repeat is off, loops when repeat is on', () => {
    const last = featuredProjectsTracks[featuredProjectsTracks.length - 1];
    usePortfolioStore.getState().setCurrentTrack(last, true, 'featured-projects');
    usePortfolioStore.getState().nextTrack(true);
    expect(usePortfolioStore.getState().currentTrack.id).toBe(featuredProjectsTracks[0].id);
    expect(usePortfolioStore.getState().isPlaying).toBe(false);

    usePortfolioStore.setState({ repeat: 'context' });
    usePortfolioStore.getState().setCurrentTrack(last, true, 'featured-projects');
    usePortfolioStore.getState().nextTrack(true);
    expect(usePortfolioStore.getState().isPlaying).toBe(true);
  });

  it('repeat-one restarts the same track when the timer runs out', () => {
    usePortfolioStore.setState({ repeat: 'track', isPlaying: true, currentTimeSeconds: TRACK_DURATION_SECONDS - 1 });
    usePortfolioStore.getState().tickProgress(1);
    const s = usePortfolioStore.getState();
    expect(s.currentTrack.id).toBe(featuredProjectsTracks[0].id);
    expect(s.currentTimeSeconds).toBe(0);
  });

  it('previous restarts the track after 3 seconds, otherwise goes back', () => {
    usePortfolioStore.getState().setCurrentTrack(featuredProjectsTracks[2], true, 'featured-projects');
    usePortfolioStore.setState({ currentTimeSeconds: 10, progress: 33 });
    usePortfolioStore.getState().prevTrack();
    expect(usePortfolioStore.getState().currentTrack.id).toBe(featuredProjectsTracks[2].id);
    expect(usePortfolioStore.getState().currentTimeSeconds).toBe(0);

    usePortfolioStore.getState().prevTrack();
    expect(usePortfolioStore.getState().currentTrack.id).toBe(featuredProjectsTracks[1].id);
  });

  it('shuffle builds an order that starts with the current track and covers the whole context', () => {
    usePortfolioStore.getState().toggleShuffle();
    const s = usePortfolioStore.getState();
    expect(s.shuffle).toBe(true);
    expect(s.shuffleOrder[0]).toBe(featuredProjectsTracks[0].id);
    expect([...s.shuffleOrder].sort()).toEqual(featuredProjectsTracks.map((t) => t.id).sort());
    expect(computeQueue(s)).toHaveLength(featuredProjectsTracks.length - 1);
  });

  it('cycles repeat off → context → track → off', () => {
    const { cycleRepeat } = usePortfolioStore.getState();
    cycleRepeat();
    expect(usePortfolioStore.getState().repeat).toBe('context');
    cycleRepeat();
    expect(usePortfolioStore.getState().repeat).toBe('track');
    cycleRepeat();
    expect(usePortfolioStore.getState().repeat).toBe('off');
  });

  it('clamps volume and treats 0 as muted', () => {
    usePortfolioStore.getState().setVolume(140);
    expect(usePortfolioStore.getState().volume).toBe(100);
    usePortfolioStore.getState().setVolume(0);
    expect(usePortfolioStore.getState().isMuted).toBe(true);
  });
});

describe('Navigation history', () => {
  beforeEach(reset);

  it('restores the Recruiter Mix (not Featured Projects) when going back to it', () => {
    const { navigateToRecruiterMix, navigateToPlaylist, navigateBack } = usePortfolioStore.getState();
    navigateToRecruiterMix();
    navigateToPlaylist('education');
    navigateBack();
    const s = usePortfolioStore.getState();
    expect(s.activeView).toBe('recruiter-mix');
    expect(s.activePlaylistId).toBe('recruiter-mix');
  });

  it('does not push duplicate entries when the same view is opened twice', () => {
    const { navigateToPlaylist } = usePortfolioStore.getState();
    navigateToPlaylist('education');
    navigateToPlaylist('education');
    expect(usePortfolioStore.getState().history).toHaveLength(2);
  });

  it('toggling lyrics returns to the previous view and stretches the timer for reading', () => {
    const { navigateToPlaylist, toggleLyrics } = usePortfolioStore.getState();
    navigateToPlaylist('education');
    toggleLyrics();
    expect(usePortfolioStore.getState().activeView).toBe('lyrics');
    expect(usePortfolioStore.getState().durationSeconds).toBe(LYRICS_DURATION_SECONDS);
    toggleLyrics();
    expect(usePortfolioStore.getState().activeView).toBe('playlist');
    expect(usePortfolioStore.getState().durationSeconds).toBe(TRACK_DURATION_SECONDS);
  });

  it('restoreView keeps Home behind a deep-linked view', () => {
    usePortfolioStore.getState().restoreView({ view: 'recommender', recommenderId: 'saeed-murtaza' });
    const s = usePortfolioStore.getState();
    expect(s.activeView).toBe('recommender');
    expect(s.history).toHaveLength(2);
    s.navigateBack();
    expect(usePortfolioStore.getState().activeView).toBe('home');
  });
});

describe('Overlays and layout', () => {
  beforeEach(reset);

  it('switching to Friend Activity re-opens a hidden sidebar', () => {
    usePortfolioStore.setState({ isRightSidebarOpen: false });
    usePortfolioStore.getState().toggleRightSidebarMode();
    expect(usePortfolioStore.getState().isRightSidebarOpen).toBe(true);
    expect(usePortfolioStore.getState().rightSidebarMode).toBe('activity');
  });

  it('Escape closes the innermost overlay first', () => {
    usePortfolioStore.setState({
      isSearchOpen: true,
      isBookingModalOpen: true,
      contextMenu: { x: 0, y: 0, items: [] },
    });
    const { closeTopmostOverlay } = usePortfolioStore.getState();
    closeTopmostOverlay();
    expect(usePortfolioStore.getState().contextMenu).toBeNull();
    expect(usePortfolioStore.getState().isBookingModalOpen).toBe(true);
    closeTopmostOverlay();
    expect(usePortfolioStore.getState().isBookingModalOpen).toBe(false);
    closeTopmostOverlay();
    expect(usePortfolioStore.getState().isSearchOpen).toBe(false);
    expect(closeTopmostOverlay()).toBe(false);
  });

  it('dragging the library below its minimum collapses it to the icon rail', () => {
    usePortfolioStore.getState().setLeftSidebarWidth(150);
    expect(usePortfolioStore.getState().isLibraryCollapsed).toBe(true);
    usePortfolioStore.getState().setLeftSidebarWidth(1000);
    expect(usePortfolioStore.getState().isLibraryCollapsed).toBe(false);
    expect(usePortfolioStore.getState().leftSidebarWidth).toBe(420);
  });

  it('askAI appends a user and an assistant message and clears the query', () => {
    usePortfolioStore.setState({ searchQuery: 'konvex' });
    usePortfolioStore.getState().askAI('Tell me about konvex');
    const s = usePortfolioStore.getState();
    expect(s.chatMessages).toHaveLength(2);
    expect(s.chatMessages[1].suggestedTrackId).toBe('project-konvex');
    expect(s.searchQuery).toBe('');
  });
});
