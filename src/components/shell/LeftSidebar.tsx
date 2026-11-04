import React, { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  LibraryIcon,
  PlusIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
  SearchIcon,
  ListIcon,
  PinIcon,
  VolumeIcon,
} from '@/components/common/Icons';
import { IconButton } from '@/components/common/IconButton';
import { Tooltip } from '@/components/common/Tooltip';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { usePortfolioStore, LEFT_SIDEBAR } from '@/stores/usePortfolioStore';
import { candidateProfile, allPlaylists } from '@/data/portfolioData';
import { RECRUITER_MIX_ID } from '@/lib/catalog';
import { copyToClipboard, openMenuAt, playlistMenuItems } from '@/lib/menus';
import { cn } from '@/lib/utils';
import { ResizeHandle } from './ResizeHandle';

type SortMode = 'custom' | 'alphabetical';

const chipClass =
  'flex h-8 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[rgba(255,255,255,0.07)] px-3 text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.04)]';

interface LeftSidebarProps {
  /** Forced icon-rail mode on narrow windows (doesn't overwrite the saved preference). */
  forceCollapsed?: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ forceCollapsed = false }) => {
  const { isLibraryCollapsed, width, activeView, activePlaylistId, recruiterMix, playContextId, isPlaying } =
    usePortfolioStore(
      useShallow((s) => ({
        isLibraryCollapsed: s.isLibraryCollapsed,
        width: s.leftSidebarWidth,
        activeView: s.activeView,
        activePlaylistId: s.activePlaylistId,
        recruiterMix: s.recruiterMix,
        playContextId: s.playContextId,
        isPlaying: s.isPlaying,
      }))
    );
  const toggleLibraryCollapse = usePortfolioStore((s) => s.toggleLibraryCollapse);
  const setLeftSidebarWidth = usePortfolioStore((s) => s.setLeftSidebarWidth);
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);
  const navigateToRecruiterMix = usePortfolioStore((s) => s.navigateToRecruiterMix);
  const setBookingModalOpen = usePortfolioStore((s) => s.setBookingModalOpen);

  const [filter, setFilter] = useState('');
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>('custom');
  const filterRef = useRef<HTMLInputElement>(null);

  const collapsed = isLibraryCollapsed || forceCollapsed;
  const panelWidth = collapsed ? LEFT_SIDEBAR.collapsed : width;

  const handleEmail = () => {
    void copyToClipboard(candidateProfile.email, 'Email copied to clipboard');
    window.location.href = `mailto:${candidateProfile.email}`;
  };

  const handlePhone = () => {
    void copyToClipboard(candidateProfile.phone, 'Phone number copied to clipboard');
    window.location.href = `tel:${candidateProfile.phone.replace(/\s/g, '')}`;
  };

  // Pinned Recruiter Mix stays on top regardless of sort, exactly like Liked Songs.
  const [pinned, ...rest] = allPlaylists;
  const query = filter.trim().toLowerCase();
  const items = [
    pinned,
    ...(sort === 'alphabetical' ? [...rest].sort((a, b) => a.title.localeCompare(b.title)) : rest),
  ].filter((p) => !query || p.title.toLowerCase().includes(query) || p.subtitle.toLowerCase().includes(query));

  return (
    <div className="relative h-full flex-shrink-0" style={{ width: panelWidth }}>
      <aside
        data-testid="left-sidebar"
        aria-label="Your Library"
        className="flex h-full flex-col overflow-hidden rounded-lg bg-surface select-none"
      >
        {/* Header */}
        <div className={cn('flex items-center px-4 pb-2 pt-3', collapsed ? 'justify-center px-0' : 'justify-between gap-2')}>
          <Tooltip label={collapsed ? 'Expand Your Library' : 'Collapse Your Library'} side={collapsed ? 'right' : 'top'}>
            <button
              type="button"
              onClick={toggleLibraryCollapse}
              aria-label={collapsed ? 'Expand Your Library' : 'Collapse Your Library'}
              className="flex h-10 items-center gap-3 px-2 text-subdued transition-colors hover:text-white"
            >
              <LibraryIcon size={24} />
              {!collapsed && <span className="text-base font-bold">Your Library</span>}
            </button>
          </Tooltip>

          {!collapsed && (
            <div className="flex items-center gap-1">
              <Tooltip label="Book a call or send a message">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(true)}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-elevated px-3 text-sm font-bold text-white transition-[transform,background-color] hover:scale-104 hover:bg-highlight"
                >
                  <PlusIcon size={16} />
                  Contact
                </button>
              </Tooltip>
              <IconButton label="Collapse Your Library" variant="ghost" onClick={toggleLibraryCollapse}>
                <ArrowLeftIcon size={16} />
              </IconButton>
            </div>
          )}
        </div>

        {/* Contact chips (scroll horizontally, fade at the edge like Spotify's filter row) */}
        {!collapsed && (
          <div className="relative px-4 py-2">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
              <a href={candidateProfile.github} target="_blank" rel="noopener noreferrer" className={chipClass}>
                GitHub <ExternalLinkIcon size={12} />
              </a>
              <a href={candidateProfile.linkedin} target="_blank" rel="noopener noreferrer" className={chipClass}>
                LinkedIn <ExternalLinkIcon size={12} />
              </a>
              <button type="button" onClick={handleEmail} className={chipClass}>
                Email
              </button>
              <button type="button" onClick={handlePhone} className={chipClass}>
                {candidateProfile.phoneDisplay}
              </button>
              <span className={cn(chipClass, 'cursor-default text-subdued hover:bg-[rgba(255,255,255,0.07)]')}>
                ISB / KHI · Remote
              </span>
            </div>
            <div className="pointer-events-none absolute inset-y-2 right-4 w-10 bg-gradient-to-l from-surface to-transparent" />
          </div>
        )}

        {/* Search in library + sort */}
        {!collapsed && (
          <div className="flex items-center justify-between gap-2 pl-4 pr-4 pt-1">
            <div
              className={cn(
                'flex h-8 items-center rounded transition-[width,background-color] duration-200 ease-spotify',
                isFilterOpen ? 'w-[188px] bg-highlight' : 'w-8'
              )}
            >
              <IconButton
                label="Search in Your Library"
                variant="ghost"
                onClick={() => {
                  setFilterOpen(true);
                  requestAnimationFrame(() => filterRef.current?.focus());
                }}
              >
                <SearchIcon size={16} />
              </IconButton>
              {isFilterOpen && (
                <input
                  ref={filterRef}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  onBlur={() => !filter && setFilterOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setFilter('');
                      setFilterOpen(false);
                    }
                  }}
                  placeholder="Search in Your Library"
                  aria-label="Search in Your Library"
                  className="w-full min-w-0 bg-transparent pr-2 text-sm text-white placeholder-subdued outline-none"
                />
              )}
            </div>
            <button
              type="button"
              onClick={(e) =>
                openMenuAt(e, [
                  { id: 'custom', label: 'Custom order', checked: sort === 'custom', onSelect: () => setSort('custom') },
                  {
                    id: 'alpha',
                    label: 'Alphabetical',
                    checked: sort === 'alphabetical',
                    onSelect: () => setSort('alphabetical'),
                  },
                ])
              }
              className="flex items-center gap-2 text-sm text-subdued transition-[color,transform] hover:scale-104 hover:text-white"
            >
              {sort === 'custom' ? 'Custom order' : 'Alphabetical'}
              <ListIcon size={16} />
            </button>
          </div>
        )}

        {/* Library list */}
        <ul className={cn('spotify-scroll flex-1 overflow-y-auto pb-2 pt-2', collapsed ? 'px-1' : 'px-2')}>
          {items.map((playlist) => {
            const isMix = playlist.id === RECRUITER_MIX_ID;
            const isActive = isMix
              ? activeView === 'recruiter-mix'
              : activeView === 'playlist' && activePlaylistId === playlist.id;
            const isContextPlaying = isPlaying && playContextId === playlist.id;
            const onOpen = () => (isMix ? navigateToRecruiterMix() : navigateToPlaylist(playlist.id));

            const row = (
              <button
                type="button"
                onClick={onOpen}
                onContextMenu={(e) => openMenuAt(e, playlistMenuItems(playlist.id))}
                data-testid={`sidebar-playlist-${playlist.id}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={collapsed ? playlist.title : undefined}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors',
                  isActive ? 'bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.14)]' : 'hover:bg-[rgba(255,255,255,0.07)] active:bg-black',
                  collapsed && 'justify-center'
                )}
              >
                <CoverArt color={playlist.coverColor} kind={artKindFor(playlist.id)} isRecruiterMix={isMix} size={48} />

                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-base', isContextPlaying ? 'text-accent' : 'text-white')}>{playlist.title}</p>
                    <p className="flex items-center gap-1 truncate text-sm text-subdued">
                      {isMix ? (
                        <>
                          <PinIcon size={12} className="flex-shrink-0 text-accent" aria-label="Pinned" />
                          <span className="truncate">
                            Playlist • <span data-testid="recruiter-mix-badge">{recruiterMix.length}</span>{' '}
                            {recruiterMix.length === 1 ? 'item' : 'items'}
                          </span>
                        </>
                      ) : (
                        <span className="truncate">{playlist.subtitle}</span>
                      )}
                    </p>
                  </div>
                )}

                {!collapsed && isContextPlaying && (
                  <VolumeIcon level={100} size={16} className="flex-shrink-0 text-accent" />
                )}
              </button>
            );

            return (
              <li key={playlist.id}>
                {collapsed ? (
                  <Tooltip label={playlist.title} side="right" className="flex w-full">
                    {row}
                  </Tooltip>
                ) : (
                  row
                )}
              </li>
            );
          })}
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-subdued">Couldn&apos;t find &quot;{filter}&quot;</li>
          )}
        </ul>
      </aside>

      {!collapsed && (
        <ResizeHandle
          edge="right"
          width={width}
          min={LEFT_SIDEBAR.min}
          max={LEFT_SIDEBAR.max}
          label="Resize Your Library"
          onResize={setLeftSidebarWidth}
        />
      )}
    </div>
  );
};
