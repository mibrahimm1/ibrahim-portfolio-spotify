import { useEffect } from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { entryToHash, hashToEntry } from '@/lib/routing';

export const SEARCH_INPUT_ID = 'global-search-input';

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

export function focusSearch() {
  usePortfolioStore.getState().setSearchOpen(true);
  const input = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null;
  input?.focus();
  input?.select();
}

/**
 * One global listener for the desktop client's keyboard shortcuts, replacing the
 * per-component listeners that used to fight each other (and toggled playback
 * when Space was pressed on a focused button).
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = usePortfolioStore.getState();
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (e.key === 'Escape') {
        if (s.closeTopmostOverlay()) {
          e.preventDefault();
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
        return;
      }

      if (mod && (key === 'k' || key === 'l')) {
        e.preventDefault();
        focusSearch();
        return;
      }

      if (mod && key === '/') {
        e.preventDefault();
        s.setShortcutsModalOpen(!s.isShortcutsModalOpen);
        return;
      }

      if (isTypingTarget(e.target)) return;

      if (e.code === 'Space') {
        // Let Space activate a focused button/link natively instead of double-firing.
        const el = e.target as HTMLElement;
        if (el.closest('button, a, [role="button"], [role="slider"], [role="menuitem"]')) return;
        e.preventDefault();
        s.togglePlay();
        return;
      }

      if (e.altKey && !mod && e.key === 'ArrowLeft') {
        e.preventDefault();
        s.navigateBack();
      } else if (e.altKey && !mod && e.key === 'ArrowRight') {
        e.preventDefault();
        s.navigateForward();
      } else if (mod && e.key === 'ArrowRight') {
        e.preventDefault();
        s.nextTrack();
      } else if (mod && e.key === 'ArrowLeft') {
        e.preventDefault();
        s.prevTrack();
      } else if (mod && e.key === 'ArrowUp') {
        e.preventDefault();
        s.setVolume(s.volume + 10);
      } else if (mod && e.key === 'ArrowDown') {
        e.preventDefault();
        s.setVolume(s.volume - 10);
      } else if (e.altKey && e.shiftKey && key === 'r') {
        e.preventDefault();
        s.toggleRightSidebar();
      } else if (e.altKey && e.shiftKey && key === 'l') {
        e.preventDefault();
        s.toggleLibraryCollapse();
      } else if (e.altKey && key === 's') {
        e.preventDefault();
        s.toggleShuffle();
      } else if (e.altKey && key === 'r') {
        e.preventDefault();
        s.cycleRepeat();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

/** Advances the silent highlight timer once per second while playing. */
export function usePlaybackTimer() {
  const isPlaying = usePortfolioStore((s) => s.isPlaying);
  const tickProgress = usePortfolioStore((s) => s.tickProgress);
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => tickProgress(1), 1000);
    return () => clearInterval(interval);
  }, [isPlaying, tickProgress]);
}

/**
 * Mirrors the current view into the URL hash (replaceState, so the in-app
 * back/forward stack stays the source of truth) and restores it on load.
 */
export function useUrlSync() {
  useEffect(() => {
    const initial = hashToEntry(window.location.hash);
    if (initial) usePortfolioStore.getState().restoreView(initial);

    const write = () => {
      const s = usePortfolioStore.getState();
      const hash = entryToHash({
        view: s.activeView,
        playlistId: s.activePlaylistId,
        recommenderId: s.activeRecommenderId ?? undefined,
      });
      const url = `${window.location.pathname}${window.location.search}${hash}`;
      if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(null, '', url);
      }
    };
    write();
    const unsubscribe = usePortfolioStore.subscribe((state, prev) => {
      if (
        state.activeView !== prev.activeView ||
        state.activePlaylistId !== prev.activePlaylistId ||
        state.activeRecommenderId !== prev.activeRecommenderId
      ) {
        write();
      }
    });

    const onHashChange = () => {
      const entry = hashToEntry(window.location.hash);
      const s = usePortfolioStore.getState();
      if (!entry) s.navigateHome();
      else if (entry.view === 'playlist' && entry.playlistId) s.navigateToPlaylist(entry.playlistId);
      else if (entry.view === 'recommender' && entry.recommenderId) s.navigateToRecommender(entry.recommenderId);
      else if (entry.view === 'recruiter-mix') s.navigateToRecruiterMix();
      else if (entry.view === 'lyrics') s.navigateToLyrics();
      else if (entry.view === 'browse') s.navigateToBrowse();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);
}
