import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  AddCircleIcon,
  CheckCircleIcon,
  CloseIcon,
  FriendsIcon,
  MoreHorizontalIcon,
  ShareIcon,
} from '@/components/common/Icons';
import { IconButton } from '@/components/common/IconButton';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { findParentPlaylistId } from '@/lib/catalog';
import { copyToClipboard, openMenuAt, trackMenuItems, trackMenuHeader } from '@/lib/menus';
import { entryToHash } from '@/lib/routing';
import { NowPlayingCards } from './NowPlayingCards';

/** Spotify's Now Playing View: sticky header, big artwork, then stacked cards. */
export const NowPlayingInspector: React.FC = () => {
  const { currentTrack, contextTitle, contextId, saved } = usePortfolioStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      contextTitle: s.currentPlaylist.title,
      contextId: s.playContextId,
      saved: s.recruiterMix.includes(s.currentTrack.id),
    }))
  );
  const toggleBookmark = usePortfolioStore((s) => s.toggleBookmark);
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);
  const setRightSidebarMode = usePortfolioStore((s) => s.setRightSidebarMode);
  const setRightSidebarOpen = usePortfolioStore((s) => s.setRightSidebarOpen);
  const toggleLyrics = usePortfolioStore((s) => s.toggleLyrics);

  const parentId = findParentPlaylistId(currentTrack.id);

  return (
    <div className="spotify-scroll flex h-full flex-col overflow-y-auto text-white select-none">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between gap-2 bg-surface px-4">
        <button
          type="button"
          onClick={() => navigateToPlaylist(contextId)}
          className="min-w-0 truncate text-base font-bold hover:underline"
          title={contextTitle}
        >
          {contextTitle}
        </button>
        <div className="flex items-center">
          <IconButton label="Switch to Faculty Endorsements" tooltip="Friend Activity" variant="ghost" onClick={() => setRightSidebarMode('activity')}>
            <FriendsIcon size={16} />
          </IconButton>
          <IconButton
            label="More options"
            variant="ghost"
            onClick={(e) => openMenuAt(e, trackMenuItems(currentTrack, contextId), trackMenuHeader(currentTrack))}
          >
            <MoreHorizontalIcon size={16} />
          </IconButton>
          <IconButton
            label="Close"
            tooltip="Hide Now Playing view"
            variant="ghost"
            onClick={() => setRightSidebarOpen(false)}
            data-testid="close-right-sidebar-btn"
          >
            <CloseIcon size={16} />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-6">
        <CoverArt
          color={currentTrack.coverColor} image={currentTrack.coverImage}
          kind={artKindFor(currentTrack.playlistId)}
          className="aspect-square w-full"
          rounded="md"
          shadow
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold leading-tight tracking-tight">
              <button type="button" onClick={() => navigateToPlaylist(parentId)} className="text-left hover:underline">
                {currentTrack.title}
              </button>
            </h2>
            <p className="mt-1 text-base text-subdued">{currentTrack.subtitle}</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1 pt-1">
            <IconButton
              label="Copy link"
              onClick={() =>
                copyToClipboard(
                  `${window.location.origin}${window.location.pathname}${entryToHash({ view: 'playlist', playlistId: parentId })}`,
                  'Link copied to clipboard'
                )
              }
            >
              <ShareIcon size={16} />
            </IconButton>
            <IconButton
              label={saved ? 'Remove from Your Recruiter Mix' : 'Save to Your Recruiter Mix'}
              active={saved}
              onClick={() => toggleBookmark(currentTrack.id)}
              aria-pressed={saved}
            >
              {saved ? <CheckCircleIcon size={20} /> : <AddCircleIcon size={20} />}
            </IconButton>
          </div>
        </div>

        <NowPlayingCards onOpenQueue={() => setRightSidebarMode('queue')} onShowLyrics={toggleLyrics} />
      </div>
    </div>
  );
};
