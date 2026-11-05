import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile } from '@/data/portfolioData';
import { SearchBody } from '@/components/search/SearchBody';
import { useIsomorphicLayoutEffect } from '@/lib/utils';
import { useIsMobile } from '@/lib/hooks';

const PILL_ID = 'search-bar-pill';

/**
 * Spotify's desktop search dropdown, anchored under the top-bar pill (no dimmed
 * backdrop). Phones use the full-screen MobileSearch instead, so this is md+ only.
 */
export const AISearchDropdown: React.FC = () => {
  const { isSearchOpen, searchQuery, chatMessages } = usePortfolioStore(
    useShallow((s) => ({ isSearchOpen: s.isSearchOpen, searchQuery: s.searchQuery, chatMessages: s.chatMessages }))
  );
  const setSearchOpen = usePortfolioStore((s) => s.setSearchOpen);
  const isMobile = useIsMobile();
  const open = isSearchOpen && !isMobile;

  const panelRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ left: number; width: number; top: number } | null>(null);

  // Track the pill's position so the dropdown lines up with it at any window size.
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const pill = document.getElementById(PILL_ID);
      if (!pill) return setRect(null);
      const r = pill.getBoundingClientRect();
      setRect({ left: r.left, width: Math.max(r.width, 420), top: r.bottom + 8 });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open]);

  // Click-away closes (clicks on the pill itself keep it open).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || document.getElementById(PILL_ID)?.contains(target)) return;
      // Context menus and dialogs opened from results shouldn't count as "away".
      if ((target as HTMLElement).closest?.('[role="menu"], [role="dialog"]')) return;
      setSearchOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open, setSearchOpen]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id="ai-search-popover"
      role="dialog"
      aria-label={`Search and ask ${candidateProfile.firstName}'s AI`}
      data-testid="ai-search-popover"
      className="fixed z-[90] flex max-h-[min(560px,calc(100vh-170px))] flex-col overflow-hidden rounded-lg bg-menu text-white shadow-spotify-elevated animate-fade-in select-none max-md:hidden"
      style={rect ? { left: rect.left, top: rect.top, width: rect.width } : { left: '50%', top: 72, width: 540, transform: 'translateX(-50%)' }}
    >
      <SearchBody onClose={() => setSearchOpen(false)} className="spotify-scroll flex-1 overflow-y-auto" />
      {chatMessages.length > 0 && !searchQuery.trim() && (
        <p className="border-t border-[rgba(255,255,255,0.1)] px-4 py-3 text-xs text-subdued">Type a follow-up in the search bar and press Enter.</p>
      )}
    </div>
  );
};
