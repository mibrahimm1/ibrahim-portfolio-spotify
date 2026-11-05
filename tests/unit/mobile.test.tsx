import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TrackList } from '@/components/stage/TrackList';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { featuredProjectsTracks, workExperienceTracks } from '@/data/portfolioData';
import { entryToHash, hashToEntry } from '@/lib/routing';
import { useUrlSync } from '@/lib/hooks';

/** Makes `(max-width: 767px)` match, as on a phone. */
function emulatePhone(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: matches && query.includes('max-width: 767px'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }),
  });
}

const freshState = () => ({
  currentTrack: featuredProjectsTracks[0],
  playContextId: 'featured-projects',
  isPlaying: false,
  selectedTrackId: null,
  recruiterMix: [],
  contextMenu: null,
  activeView: 'home' as const,
  activePlaylistId: 'featured-projects',
  activeRecommenderId: null,
  history: [{ view: 'home' as const }],
  historyIndex: 0,
  isFullPlayerOpen: false,
  isProfileDrawerOpen: false,
  isQueueSheetOpen: false,
  isBookingModalOpen: false,
  isThemeModalOpen: false,
  isShortcutsModalOpen: false,
  isSearchOpen: false,
  isLyricsOpen: false,
  mobileTab: 'home' as const,
  recentlyPlayed: [],
  homeFilter: 'all',
});

const wait = (ms = 80) => new Promise((r) => setTimeout(r, ms));

describe('mobile routes', () => {
  it('round-trips the Library and Contact tabs', () => {
    expect(entryToHash({ view: 'library' })).toBe('#/library');
    expect(entryToHash({ view: 'contact' })).toBe('#/contact');
    expect(hashToEntry('#/library')).toEqual({ view: 'library' });
    expect(hashToEntry('#/contact')).toEqual({ view: 'contact' });
  });
});

describe('mobile store state', () => {
  beforeEach(() => usePortfolioStore.setState(freshState()));

  it('keeps the active tab in step with root pages', () => {
    const s = usePortfolioStore.getState();
    s.navigateToLibrary();
    expect(usePortfolioStore.getState().mobileTab).toBe('library');
    s.navigateToBrowse();
    expect(usePortfolioStore.getState().mobileTab).toBe('search');
    s.navigateToContact();
    expect(usePortfolioStore.getState().mobileTab).toBe('contact');
    // A page opened from a tab keeps that tab highlighted.
    s.navigateToPlaylist('work-experience');
    expect(usePortfolioStore.getState().mobileTab).toBe('contact');
  });

  it('jumps straight to a history index', () => {
    const s = usePortfolioStore.getState();
    s.navigateToPlaylist('work-experience');
    s.navigateToLibrary();
    s.navigateToContact();
    usePortfolioStore.getState().goToHistoryIndex(1);
    const after = usePortfolioStore.getState();
    expect(after.historyIndex).toBe(1);
    expect(after.activeView).toBe('playlist');
    expect(after.activePlaylistId).toBe('work-experience');
    expect(after.history).toHaveLength(4);
  });

  it('remembers recently played items, newest first, without duplicates', () => {
    const { setCurrentTrack } = usePortfolioStore.getState();
    setCurrentTrack(workExperienceTracks[0], true);
    setCurrentTrack(workExperienceTracks[1], true);
    setCurrentTrack(workExperienceTracks[0], true);
    expect(usePortfolioStore.getState().recentlyPlayed.slice(0, 2)).toEqual([workExperienceTracks[0].id, workExperienceTracks[1].id]);
  });

  it('closes the topmost phone overlay first', () => {
    usePortfolioStore.setState({ isFullPlayerOpen: true, isQueueSheetOpen: true });
    usePortfolioStore.getState().closeTopmostOverlay();
    expect(usePortfolioStore.getState().isQueueSheetOpen).toBe(false);
    expect(usePortfolioStore.getState().isFullPlayerOpen).toBe(true);
    usePortfolioStore.getState().closeTopmostOverlay();
    expect(usePortfolioStore.getState().isFullPlayerOpen).toBe(false);
  });
});

describe('TrackList on phones', () => {
  beforeEach(() => {
    emulatePhone(true);
    usePortfolioStore.setState(freshState());
  });
  afterEach(() => {
    emulatePhone(false);
    vi.useRealTimers();
  });

  it('plays on a single tap, as the mobile app does', () => {
    render(<TrackList tracks={workExperienceTracks} contextId="work-experience" />);
    fireEvent.click(screen.getByRole('button', { name: `Play ${workExperienceTracks[1].title}` }));
    const s = usePortfolioStore.getState();
    expect(s.currentTrack.id).toBe(workExperienceTracks[1].id);
    expect(s.playContextId).toBe('work-experience');
    expect(s.isPlaying).toBe(true);
  });

  it('opens the bottom-sheet menu on a long press without playing', () => {
    vi.useFakeTimers();
    render(<TrackList tracks={workExperienceTracks} contextId="work-experience" />);
    const track = workExperienceTracks[1];
    const row = screen.getByTestId(`track-row-${track.id}`);
    fireEvent.pointerDown(row, { clientX: 10, clientY: 10 });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    fireEvent.pointerUp(row);
    const menu = usePortfolioStore.getState().contextMenu;
    expect(menu?.header?.title).toBe(track.title);
    expect(menu?.items.map((i) => i.label)).toContain('Save to Your Recruiter Mix');
    expect(usePortfolioStore.getState().isPlaying).toBe(false);
  });

  it('opens the menu from the "…" button', () => {
    render(<TrackList tracks={workExperienceTracks} contextId="work-experience" />);
    fireEvent.click(screen.getByTestId(`track-more-${workExperienceTracks[0].id}`));
    expect(usePortfolioStore.getState().contextMenu?.header?.title).toBe(workExperienceTracks[0].title);
  });
});

describe('browser history sync', () => {
  beforeEach(() => {
    emulatePhone(true);
    usePortfolioStore.setState(freshState());
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => emulatePhone(false));

  it('pushes an entry per page and maps Back to the in-app history', async () => {
    const { unmount } = renderHook(() => useUrlSync());
    act(() => usePortfolioStore.getState().navigateToPlaylist('work-experience'));
    expect(window.location.hash).toBe('#/playlist/work-experience');
    expect(window.history.state).toMatchObject({ app: 1, idx: 1 });

    await act(async () => {
      window.history.back();
      await wait();
    });
    expect(usePortfolioStore.getState().activeView).toBe('home');
    expect(usePortfolioStore.getState().historyIndex).toBe(0);
    unmount();
  });

  it('closes an open sheet on Back before leaving the page', async () => {
    const { unmount } = renderHook(() => useUrlSync());
    act(() => usePortfolioStore.getState().navigateToPlaylist('work-experience'));
    act(() => usePortfolioStore.getState().setFullPlayerOpen(true));
    expect(window.history.state).toMatchObject({ overlay: true });

    await act(async () => {
      window.history.back();
      await wait();
    });
    expect(usePortfolioStore.getState().isFullPlayerOpen).toBe(false);
    expect(usePortfolioStore.getState().activeView).toBe('playlist');

    await act(async () => {
      window.history.back();
      await wait();
    });
    expect(usePortfolioStore.getState().activeView).toBe('home');
    unmount();
  });

  it("keeps Next's own history fields, so Back never hard-reloads the app", async () => {
    window.history.replaceState({ __NA: true, tree: 'x' }, '', '/');
    const { unmount } = renderHook(() => useUrlSync());
    expect(window.history.state).toMatchObject({ __NA: true, tree: 'x', app: 1, idx: 0 });
    act(() => usePortfolioStore.getState().setThemeModalOpen(true));
    expect(window.history.state).toMatchObject({ __NA: true, overlay: true });
    act(() => usePortfolioStore.getState().setThemeModalOpen(false));
    await act(async () => {
      await wait();
    });
    expect(window.history.state).toEqual({ __NA: true, tree: 'x', app: 1, idx: 0 });
    unmount();
  });

  it('drops the overlay entry when a sheet is closed from the UI', async () => {
    const { unmount } = renderHook(() => useUrlSync());
    act(() => usePortfolioStore.getState().setProfileDrawerOpen(true));
    expect(window.history.state).toMatchObject({ overlay: true });
    act(() => usePortfolioStore.getState().setProfileDrawerOpen(false));
    await act(async () => {
      await wait();
    });
    expect(window.history.state).toMatchObject({ app: 1, idx: 0 });
    expect(window.history.state.overlay).toBeUndefined();
    // The pop we caused ourselves must not move the app.
    expect(usePortfolioStore.getState().activeView).toBe('home');
    unmount();
  });
});
