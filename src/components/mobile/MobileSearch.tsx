import React, { useEffect, useRef } from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile } from '@/data/portfolioData';
import { SearchBody } from '@/components/search/SearchBody';
import { CloseIcon, SearchIcon } from '@/components/common/Icons';
import { useIsMobile } from '@/lib/hooks';

export const MOBILE_SEARCH_INPUT_ID = 'mobile-search-input';

/**
 * Spotify's phone search screen: opens full screen when you tap the search field, with
 * the keyboard up, a Cancel button, and suggestions → live results → the AI chat below.
 * Uses `visualViewport` so the input stays above the on-screen keyboard.
 */
export const MobileSearch: React.FC = () => {
  const isMobile = useIsMobile();
  const open = usePortfolioStore((s) => s.isSearchOpen);
  const query = usePortfolioStore((s) => s.searchQuery);
  const setOpen = usePortfolioStore((s) => s.setSearchOpen);
  const setQuery = usePortfolioStore((s) => s.setSearchQuery);
  const askAI = usePortfolioStore((s) => s.askAI);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !isMobile) return;
    inputRef.current?.focus();
    const vv = window.visualViewport;
    if (!vv || !panelRef.current) return;
    const fit = () => {
      if (panelRef.current) panelRef.current.style.height = `${vv.height}px`;
    };
    fit();
    vv.addEventListener('resize', fit);
    return () => vv.removeEventListener('resize', fit);
  }, [open, isMobile]);

  if (!open || !isMobile) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Search and ask ${candidateProfile.firstName}'s AI`}
      data-testid="m-search"
      className="fixed inset-x-0 top-0 z-[90] flex h-[100dvh] flex-col bg-surface text-white md:hidden"
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          askAI(query);
          inputRef.current?.blur();
        }}
        className="flex flex-shrink-0 items-center gap-3 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))]"
      >
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md bg-highlight px-3">
          <SearchIcon size={18} className="flex-shrink-0 text-white" />
          <input
            ref={inputRef}
            id={MOBILE_SEARCH_INPUT_ID}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to know?"
            aria-label="Search or ask a question"
            className="min-w-0 flex-1 bg-transparent text-base text-white placeholder-subdued outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" aria-label="Clear" onClick={() => setQuery('')} className="text-subdued">
              <CloseIcon size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setOpen(false);
          }}
          className="flex-shrink-0 text-base font-bold"
        >
          Cancel
        </button>
      </form>
      <SearchBody onClose={() => setOpen(false)} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-safe" />
    </div>
  );
};
