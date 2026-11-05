import { useEffect, useSyncExternalStore } from 'react';
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

/* ------------------------------ Viewport ------------------------------- */

/** Phones get the Spotify mobile-app shell below this width (Tailwind's `md`). */
export const MOBILE_QUERY = '(max-width: 767px)';

export function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(MOBILE_QUERY).matches;
}

function subscribeViewport(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * Behaviour switch for phones (tap-to-play, sheets instead of menus). Layout itself is
 * CSS-gated with `md:` classes, so the static HTML never flashes the wrong shell.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeViewport, isMobileViewport, () => false);
}

/* ------------------------------- History -------------------------------- */

type HistoryState = { app: 1; idx: number; overlay?: true };

/** Overlays that the browser/phone Back gesture should close before leaving the page. */
function overlayDepth(s: ReturnType<typeof usePortfolioStore.getState>): number {
  const mobile = isMobileViewport();
  return [
    s.isFullPlayerOpen,
    s.isProfileDrawerOpen,
    s.isQueueSheetOpen,
    s.isBookingModalOpen,
    s.isThemeModalOpen,
    s.isShortcutsModalOpen,
    mobile && !!s.contextMenu, // the bottom-sheet version of the menu
    mobile && s.isSearchOpen, // the full-screen phone search
  ].filter(Boolean).length;
}

/**
 * Keeps the app's own back/forward stack and the browser's history in step, so the
 * browser buttons, Alt+arrow keys and the phone Back gesture all behave like Spotify:
 *
 *  - every new page pushes an entry (`#/playlist/…`, `#/user/…`), so links stay shareable;
 *  - Back/Forward map to `goToHistoryIndex`, using the index saved on each entry;
 *  - opening a sheet, dialog, drawer or the full player pushes an extra entry, so Back
 *    closes it first instead of leaving the page;
 *  - a deep link keeps Home underneath it, so Back from a shared link lands on Home.
 */
export function useUrlSync() {
  useEffect(() => {
    const store = usePortfolioStore;
    const base = `${window.location.pathname}${window.location.search}`;
    const urlFor = (s: ReturnType<typeof store.getState>) =>
      `${base}${entryToHash({ view: s.activeView, playlistId: s.activePlaylistId, recommenderId: s.activeRecommenderId ?? undefined })}`;
    // Merge into the existing entry state: Next's App Router keeps its own fields there and
    // hard-reloads on Back to an entry without them. (Our first write runs before Next has
    // patched `history` to copy them over itself.)
    const stateFor = (idx: number, overlay = false) => {
      const { overlay: _drop, ...rest } = (window.history.state ?? {}) as Partial<HistoryState> & Record<string, unknown>;
      void _drop;
      const ours: HistoryState = overlay ? { app: 1, idx, overlay: true } : { app: 1, idx };
      return { ...rest, ...ours };
    };

    let browserIdx = 0; // store index the current browser entry represents
    let ignorePops = 0; // pops we caused ourselves with history.go()
    let fromPop = false; // the next store change came from a browser Back/Forward
    let adoptHash = false; // the next store change came from a hand-edited hash
    let pushedOverlays = 0;

    const initial = hashToEntry(window.location.hash);
    if (initial && initial.view !== 'home') {
      store.getState().restoreView(initial);
      window.history.replaceState(stateFor(0), '', base);
      window.history.pushState(stateFor(1), '', urlFor(store.getState()));
      browserIdx = 1;
    } else {
      window.history.replaceState(stateFor(0), '', urlFor(store.getState()));
    }

    const unsubscribe = store.subscribe((s, prev) => {
      // 1. Overlays
      const depth = overlayDepth(s);
      if (depth > pushedOverlays) {
        for (let i = pushedOverlays; i < depth; i++) window.history.pushState(stateFor(browserIdx, true), '', window.location.href);
        pushedOverlays = depth;
      } else if (depth < pushedOverlays) {
        const closed = pushedOverlays - depth;
        pushedOverlays = depth;
        const idxAtClose = browserIdx;
        // Closed from the UI: drop our overlay entries, unless the same action also opened a page.
        setTimeout(() => {
          if (browserIdx === idxAtClose) {
            ignorePops += 1;
            window.history.go(-closed);
          }
        }, 0);
      }

      // 2. Pages
      const viewChanged =
        s.historyIndex !== prev.historyIndex ||
        s.history !== prev.history ||
        s.activeView !== prev.activeView ||
        s.activePlaylistId !== prev.activePlaylistId ||
        s.activeRecommenderId !== prev.activeRecommenderId;
      if (!viewChanged) return;

      const target = s.historyIndex;
      if (fromPop) {
        fromPop = false;
        browserIdx = target;
        return;
      }
      if (adoptHash) {
        adoptHash = false;
        window.history.replaceState(stateFor(target), '', urlFor(s));
      } else if (s.history !== prev.history && target === s.history.length - 1 && target > browserIdx) {
        window.history.pushState(stateFor(target), '', urlFor(s));
      } else if (target !== browserIdx) {
        ignorePops += 1;
        window.history.go(target - browserIdx);
      } else {
        window.history.replaceState(stateFor(target), '', urlFor(s));
      }
      browserIdx = target;
    });

    const onPopState = (e: PopStateEvent) => {
      if (ignorePops > 0) {
        ignorePops -= 1;
        return;
      }
      const s = store.getState();
      if (pushedOverlays > 0) {
        pushedOverlays -= 1;
        s.closeTopmostOverlay();
        return;
      }
      const state = e.state as HistoryState | null;
      if (state?.app && typeof state.idx === 'number') {
        if (state.idx !== s.historyIndex && state.idx < s.history.length) {
          fromPop = true;
          s.goToHistoryIndex(state.idx);
        }
        browserIdx = state.idx;
      }
    };

    // A hash typed or pasted into the address bar creates an entry we didn't push.
    const onHashChange = () => {
      if ((window.history.state as HistoryState | null)?.app) return;
      const entry = hashToEntry(window.location.hash);
      const s = store.getState();
      adoptHash = true;
      if (!entry) s.navigateHome();
      else if (entry.view === 'playlist' && entry.playlistId) s.navigateToPlaylist(entry.playlistId);
      else if (entry.view === 'recommender' && entry.recommenderId) s.navigateToRecommender(entry.recommenderId);
      else if (entry.view === 'recruiter-mix') s.navigateToRecruiterMix();
      else if (entry.view === 'lyrics') s.navigateToLyrics();
      else if (entry.view === 'browse') s.navigateToBrowse();
      else if (entry.view === 'library') s.navigateToLibrary();
      else if (entry.view === 'contact') s.navigateToContact();
      // Already on that page: nothing changed, so just label the entry ourselves.
      if (adoptHash) {
        adoptHash = false;
        window.history.replaceState(stateFor(store.getState().historyIndex), '', window.location.href);
      }
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      unsubscribe();
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);
}
