import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { starterPrompts, allPlaylists, candidateProfile } from '@/data/portfolioData';
import { allTracks, findTrack } from '@/lib/catalog';
import { SearchIcon, ArrowRightIcon } from '@/components/common/Icons';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { useIsomorphicLayoutEffect, cn } from '@/lib/utils';
import { Track } from '@/types/portfolio';

const PILL_ID = 'search-bar-pill';

function matches(text: string, q: string) {
  return text.toLowerCase().includes(q);
}

/**
 * Spotify's search dropdown, anchored under the top-bar pill (no dimmed
 * backdrop). Three states: suggested questions ("Recent searches"), live
 * results while typing, and the first-person AI conversation.
 */
export const AISearchDropdown: React.FC = () => {
  const { isSearchOpen, searchQuery, chatMessages } = usePortfolioStore(
    useShallow((s) => ({ isSearchOpen: s.isSearchOpen, searchQuery: s.searchQuery, chatMessages: s.chatMessages }))
  );
  const setSearchOpen = usePortfolioStore((s) => s.setSearchOpen);
  const askAI = usePortfolioStore((s) => s.askAI);
  const clearChat = usePortfolioStore((s) => s.clearChat);
  const openTrackDetails = usePortfolioStore((s) => s.openTrackDetails);
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);

  const panelRef = useRef<HTMLDivElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ left: number; width: number; top: number } | null>(null);

  // Track the pill's position so the dropdown lines up with it at any window size.
  useIsomorphicLayoutEffect(() => {
    if (!isSearchOpen) return;
    const place = () => {
      const pill = document.getElementById(PILL_ID);
      if (!pill) return setRect(null);
      const r = pill.getBoundingClientRect();
      setRect({ left: r.left, width: Math.max(r.width, 420), top: r.bottom + 8 });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [isSearchOpen]);

  // Click-away closes (clicks on the pill itself keep it open).
  useEffect(() => {
    if (!isSearchOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || document.getElementById(PILL_ID)?.contains(target)) return;
      // Context menus and dialogs opened from results shouldn't count as "away".
      if ((target as HTMLElement).closest?.('[role="menu"], [role="dialog"]')) return;
      setSearchOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [isSearchOpen, setSearchOpen]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView?.({ block: 'end' });
  }, [chatMessages.length]);

  if (!isSearchOpen) return null;

  const q = searchQuery.trim().toLowerCase();
  const trackResults: Track[] = q
    ? allTracks
        .filter((t) => matches(t.title, q) || matches(t.subtitle, q) || t.credits.some((c) => matches(c.item, q)))
        .slice(0, 5)
    : [];
  const playlistResults = q ? allPlaylists.filter((p) => matches(p.title, q)).slice(0, 3) : [];

  const openTrack = (track: Track) => {
    openTrackDetails(track);
    setSearchOpen(false);
  };

  const rowClass =
    'group flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-[rgba(255,255,255,0.1)] focus-visible:bg-[rgba(255,255,255,0.1)]';

  return (
    <div
      ref={panelRef}
      id="ai-search-popover"
      role="dialog"
      aria-label="Search and ask Ibrahim's AI"
      data-testid="ai-search-popover"
      className="fixed z-[90] flex max-h-[min(560px,calc(100vh-170px))] flex-col overflow-hidden rounded-lg bg-menu text-white shadow-spotify-elevated animate-fade-in select-none"
      style={
        rect
          ? { left: rect.left, top: rect.top, width: rect.width }
          : { left: '50%', top: 72, width: 540, transform: 'translateX(-50%)' }
      }
    >
      <div className="spotify-scroll flex-1 overflow-y-auto p-2">
        {q && (
          <>
            <button type="button" onClick={() => askAI(searchQuery)} className={rowClass} data-testid="ask-ai-row">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-accent text-black">
                <SearchIcon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base">
                  Ask Ibrahim&apos;s AI: <span className="font-bold">“{searchQuery.trim()}”</span>
                </span>
                <span className="block text-sm text-subdued">Press Enter to ask</span>
              </span>
            </button>

            {(trackResults.length > 0 || playlistResults.length > 0) && (
              <p className="px-2 pb-1 pt-3 text-base font-bold">Results</p>
            )}
            {playlistResults.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  navigateToPlaylist(p.id);
                  setSearchOpen(false);
                }}
                className={rowClass}
              >
                <CoverArt color={p.coverColor} kind={artKindFor(p.id)} isRecruiterMix={p.id === 'recruiter-mix'} size={48} />
                <span className="min-w-0">
                  <span className="block truncate text-base">{p.title}</span>
                  <span className="block truncate text-sm text-subdued">Playlist</span>
                </span>
              </button>
            ))}
            {trackResults.map((t) => (
              <button key={t.id} type="button" onClick={() => openTrack(t)} className={rowClass}>
                <CoverArt color={t.coverColor} kind={artKindFor(t.playlistId)} size={48} />
                <span className="min-w-0">
                  <span className="block truncate text-base">{t.title}</span>
                  <span className="block truncate text-sm text-subdued">{t.subtitle}</span>
                </span>
              </button>
            ))}
          </>
        )}

        {!q && chatMessages.length === 0 && (
          <div>
            <p className="px-2 pb-1 pt-2 text-base font-bold">Suggested questions</p>
            {starterPrompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => askAI(prompt.question)}
                data-testid={`starter-prompt-${prompt.id === 'prompt-2' ? 'bizbuddy' : prompt.id}`}
                className={rowClass}
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-[#333] text-subdued group-hover:text-white">
                  <SearchIcon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base">{prompt.question}</span>
                  <span className="block truncate text-sm text-subdued">{prompt.subtitle}</span>
                </span>
                <ArrowRightIcon size={16} className="flex-shrink-0 text-subdued opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}

        {!q && chatMessages.length > 0 && (
          <div className="space-y-3 p-2">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold">Ask Ibrahim</p>
              <button type="button" onClick={clearChat} className="text-sm font-bold text-subdued hover:text-white hover:underline">
                Clear chat
              </button>
            </div>
            {chatMessages.map((msg) =>
              msg.sender === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl bg-accent px-4 py-2 text-sm font-bold text-black">{msg.content}</p>
                </div>
              ) : (
                <div
                  key={msg.id}
                  data-testid="chat-message-ai"
                  className="max-w-[92%] select-text space-y-3 rounded-lg bg-[rgba(255,255,255,0.07)] p-4 text-sm leading-relaxed"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#535353] text-[11px] font-bold">I</span>
                    <span className="text-sm font-bold">{candidateProfile.name}</span>
                  </div>
                  <p>{msg.content}</p>
                  {msg.suggestedTrackId && msg.suggestedTrackTitle && (
                    <button
                      type="button"
                      onClick={() => {
                        const track = findTrack(msg.suggestedTrackId);
                        if (track) openTrack(track);
                      }}
                      className={cn(
                        'inline-flex max-w-full items-center gap-2 rounded-full bg-[rgba(255,255,255,0.1)] py-1 pl-1 pr-3 text-sm font-bold transition-colors hover:bg-[rgba(255,255,255,0.16)]'
                      )}
                    >
                      {(() => {
                        const track = findTrack(msg.suggestedTrackId);
                        return track ? <CoverArt color={track.coverColor} kind={artKindFor(track.playlistId)} size={24} /> : null;
                      })()}
                      <span className="flex-shrink-0">Inspect Project:</span>
                      <span className="truncate font-normal text-subdued">{msg.suggestedTrackTitle}</span>
                    </button>
                  )}
                </div>
              )
            )}
            <div ref={threadEndRef} />
          </div>
        )}
      </div>

      {chatMessages.length > 0 && !q && (
        <p className="border-t border-[rgba(255,255,255,0.1)] px-4 py-3 text-xs text-subdued">
          Type a follow-up in the search bar and press Enter.
        </p>
      )}
    </div>
  );
};
