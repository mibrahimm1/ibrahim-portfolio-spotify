import React from 'react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import {
  HomeIcon,
  SearchIcon,
  BrowseIcon,
  BellIcon,
  FriendsIcon,
  MinimizeIcon,
  MaximizeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  CloseIcon,
} from '@/components/common/Icons';
import { IconButton } from '@/components/common/IconButton';
import { Tooltip } from '@/components/common/Tooltip';
import { spotifyButtonClasses } from '@/components/common/SpotifyButton';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile, whatsNew } from '@/data/portfolioData';
import { findTrack } from '@/lib/catalog';
import { Track } from '@/types/portfolio';
import { SEARCH_INPUT_ID } from '@/lib/hooks';
import { downloadResume, openMenuAt } from '@/lib/menus';
import { cn } from '@/lib/utils';

export const SEARCH_PILL_ID = 'search-bar-pill';

export const TopNavBar: React.FC = () => {
  const { activeView, historyIndex, historyLength, rightSidebarMode, isRightSidebarOpen, searchQuery, isSearchOpen } =
    usePortfolioStore(
      useShallow((s) => ({
        activeView: s.activeView,
        historyIndex: s.historyIndex,
        historyLength: s.history.length,
        rightSidebarMode: s.rightSidebarMode,
        isRightSidebarOpen: s.isRightSidebarOpen,
        searchQuery: s.searchQuery,
        isSearchOpen: s.isSearchOpen,
      }))
    );
  const navigateHome = usePortfolioStore((s) => s.navigateHome);
  const navigateBack = usePortfolioStore((s) => s.navigateBack);
  const navigateForward = usePortfolioStore((s) => s.navigateForward);
  const navigateToBrowse = usePortfolioStore((s) => s.navigateToBrowse);
  const toggleRightSidebarMode = usePortfolioStore((s) => s.toggleRightSidebarMode);
  const setSearchOpen = usePortfolioStore((s) => s.setSearchOpen);
  const setSearchQuery = usePortfolioStore((s) => s.setSearchQuery);
  const askAI = usePortfolioStore((s) => s.askAI);
  const setBookingModalOpen = usePortfolioStore((s) => s.setBookingModalOpen);
  const setThemeModalOpen = usePortfolioStore((s) => s.setThemeModalOpen);
  const setShortcutsModalOpen = usePortfolioStore((s) => s.setShortcutsModalOpen);
  const openTrackDetails = usePortfolioStore((s) => s.openTrackDetails);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < historyLength - 1;
  const friendsActive = isRightSidebarOpen && rightSidebarMode === 'activity';

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const appMenu = (e: React.MouseEvent) =>
    openMenuAt(e, [
      { id: 'home', label: 'Home', onSelect: navigateHome },
      { id: 'browse', label: 'Browse', onSelect: navigateToBrowse },
      { id: 'theme', label: 'Accent colour…', dividerBefore: true, onSelect: () => setThemeModalOpen(true) },
      { id: 'shortcuts', label: 'Keyboard shortcuts', onSelect: () => setShortcutsModalOpen(true) },
      {
        id: 'resume',
        label: 'Standard resume view',
        dividerBefore: true,
        onSelect: () => {
          window.location.href = '/resume';
        },
      },
      { id: 'pdf', label: 'Download resume (PDF)', onSelect: downloadResume },
    ]);

  const openWhatsNew = (e: React.MouseEvent) =>
    openMenuAt(
      e,
      whatsNew
        .map((id) => findTrack(id))
        .filter((t): t is Track => Boolean(t))
        .map((track) => ({
        id: track.id,
        label: `${track.dateAdded.split(' – ')[0]} · ${track.subtitle.split(' · ')[0]} — ${track.title}`,
        onSelect: () => openTrackDetails(track),
      }))
    );

  return (
    <header
      data-testid="top-nav-bar"
      className="relative z-40 flex h-16 w-full flex-shrink-0 items-center justify-between gap-2 bg-black pl-2 pr-2 text-white select-none"
    >
      {/* Left: app menu + history (Spotify desktop for Windows) */}
      <div className="flex flex-1 items-center gap-2">
        <IconButton label="Menu" tooltip="Menu" tooltipSide="bottom" onClick={appMenu}>
          <MoreHorizontalIcon size={16} />
        </IconButton>
        <IconButton
          label="Previous view"
          tooltip="Go back"
          tooltipSide="bottom"
          onClick={navigateBack}
          disabled={!canGoBack}
        >
          <ChevronLeftIcon size={16} />
        </IconButton>
        <IconButton
          label="Next view"
          tooltip="Go forward"
          tooltipSide="bottom"
          onClick={navigateForward}
          disabled={!canGoForward}
        >
          <ChevronRightIcon size={16} />
        </IconButton>
      </div>

      {/* Centre: Home + search, centred on the window like the real client */}
      <div className="flex w-[min(540px,46vw)] flex-shrink-0 items-center gap-2">
        <Tooltip label="Home" side="bottom">
          <button
            type="button"
            onClick={navigateHome}
            aria-label="Return to candidate home"
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-elevated transition-[transform,background-color] duration-150 hover:scale-104 hover:bg-highlight',
              activeView === 'home' ? 'text-white' : 'text-subdued hover:text-white'
            )}
          >
            <HomeIcon size={24} active={activeView === 'home'} />
          </button>
        </Tooltip>

        <form
          id={SEARCH_PILL_ID}
          data-testid="search-bar-pill"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            askAI(searchQuery);
          }}
          onClick={() => {
            setSearchOpen(true);
            document.getElementById(SEARCH_INPUT_ID)?.focus();
          }}
          className={cn(
            'group flex h-12 min-w-0 flex-1 cursor-text items-center gap-3 rounded-full border border-transparent bg-elevated pl-3 pr-2 transition-colors duration-150 hover:border-[#333] hover:bg-highlight focus-within:!border-white focus-within:ring-1 focus-within:ring-white',
            isSearchOpen && 'border-white ring-1 ring-white'
          )}
        >
          <SearchIcon size={24} className="flex-shrink-0 text-subdued group-focus-within:text-white" />
          <input
            id={SEARCH_INPUT_ID}
            type="text"
            role="combobox"
            aria-expanded={isSearchOpen}
            aria-controls="ai-search-popover"
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            value={searchQuery}
            placeholder={`What do you want to play? — Ask ${candidateProfile.firstName}'s AI anything`}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            className="w-full min-w-0 bg-transparent text-base text-white placeholder-subdued outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search field"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
                document.getElementById(SEARCH_INPUT_ID)?.focus();
              }}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-subdued hover:text-white"
            >
              <CloseIcon size={16} />
            </button>
          )}
          <span className="h-6 w-px flex-shrink-0 bg-[#7c7c7c]" aria-hidden="true" />
          <Tooltip label="Browse" side="bottom">
            <button
              type="button"
              aria-label="Browse"
              onClick={(e) => {
                e.stopPropagation();
                setSearchOpen(false);
                navigateToBrowse();
              }}
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center hover:scale-104 hover:text-white',
                activeView === 'browse' ? 'text-white' : 'text-subdued'
              )}
            >
              <BrowseIcon size={24} />
            </button>
          </Tooltip>
        </form>
      </div>

      {/* Right: CTA pill, bell, friend activity, avatar, window controls */}
      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setBookingModalOpen(true)}
          className={cn(spotifyButtonClasses('white', 'sm'), 'hidden lg:inline-flex')}
        >
          Book a call
        </button>
        <IconButton label="What's New" tooltipSide="bottom" onClick={openWhatsNew}>
          <BellIcon size={16} />
        </IconButton>
        <IconButton
          label="Toggle Faculty Endorsements Feed"
          tooltip="Friend Activity"
          tooltipSide="bottom"
          active={friendsActive}
          onClick={toggleRightSidebarMode}
          aria-pressed={friendsActive}
        >
          <FriendsIcon size={16} />
        </IconButton>
        <Tooltip label={candidateProfile.name} side="bottom">
          <button
            type="button"
            onClick={(e) =>
              openMenuAt(e, [
                { id: 'profile', label: 'Profile', onSelect: navigateHome },
                { id: 'theme', label: 'Accent colour…', onSelect: () => setThemeModalOpen(true) },
                { id: 'shortcuts', label: 'Keyboard shortcuts', onSelect: () => setShortcutsModalOpen(true) },
                {
                  id: 'linkedin',
                  label: 'LinkedIn',
                  external: true,
                  dividerBefore: true,
                  onSelect: () => window.open(candidateProfile.linkedin, '_blank', 'noopener,noreferrer'),
                },
                {
                  id: 'github',
                  label: 'GitHub',
                  external: true,
                  onSelect: () => window.open(candidateProfile.github, '_blank', 'noopener,noreferrer'),
                },
              ])
            }
            aria-label={`${candidateProfile.name} profile menu`}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-elevated transition-transform duration-150 hover:scale-104"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#535353] text-sm font-bold text-white">
              {candidateProfile.avatarLetter}
            </span>
          </button>
        </Tooltip>

        {/* Window controls: "minimise" is the recruiter escape hatch to the plain resume */}
        <div className="ml-2 flex items-center">
          <div className="group relative">
            <Link
              href="/resume"
              data-testid="minimize-escape-hatch"
              aria-label="Switch to Standard Resume View"
              className="flex h-8 w-11 items-center justify-center rounded text-subdued transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
            >
              <MinimizeIcon size={16} />
            </Link>
            <div
              data-testid="escape-hatch-tooltip"
              role="tooltip"
              className="pointer-events-none absolute right-0 top-10 z-50 hidden whitespace-nowrap rounded bg-menu px-2 py-1 text-sm text-white shadow-spotify-elevated group-hover:block group-focus-within:block"
            >
              Switch to Standard Resume View
            </div>
          </div>
          <Tooltip label="Full screen" side="bottom">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toggle full screen"
              className="flex h-8 w-11 items-center justify-center rounded text-subdued transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
            >
              <MaximizeIcon size={14} />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
