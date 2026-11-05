import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Track } from '@/types/portfolio';
import { CloseIcon, PlayIcon } from '@/components/common/Icons';
import { IconButton } from '@/components/common/IconButton';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { usePortfolioStore, computeQueue } from '@/stores/usePortfolioStore';
import { openMenuAt, trackMenuItems, trackMenuHeader } from '@/lib/menus';
import { cn } from '@/lib/utils';

const QueueRow: React.FC<{ track: Track; contextId: string; current?: boolean; isPlaying?: boolean }> = ({
  track,
  contextId,
  current = false,
  isPlaying = false,
}) => {
  const setCurrentTrack = usePortfolioStore((s) => s.setCurrentTrack);
  const togglePlay = usePortfolioStore((s) => s.togglePlay);
  return (
    <button
      type="button"
      onClick={() => (current ? togglePlay() : setCurrentTrack(track, true, contextId))}
      onContextMenu={(e) => openMenuAt(e, trackMenuItems(track, contextId), trackMenuHeader(track))}
      className="group flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-[rgba(255,255,255,0.1)]"
    >
      <span className="relative flex-shrink-0">
        <CoverArt color={track.coverColor} image={track.coverImage} kind={artKindFor(track.playlistId)} size={48} />
        <span className="absolute inset-0 hidden items-center justify-center rounded bg-[rgba(0,0,0,0.5)] group-hover:flex">
          <PlayIcon size={16} />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-base', current ? 'text-accent' : 'text-white')}>{track.title}</span>
        <span className="block truncate text-sm text-subdued">{track.subtitle}</span>
      </span>
      {current && isPlaying && (
        <span className="equalizer mr-1" aria-label="Now playing">
          <span />
          <span />
          <span />
          <span />
        </span>
      )}
    </button>
  );
};

/** Spotify's Queue panel: "Now playing" followed by "Next from: <context>". */
export const QueuePanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { currentTrack, contextTitle, contextId, isPlaying } = usePortfolioStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      contextTitle: s.currentPlaylist.title,
      contextId: s.playContextId,
      isPlaying: s.isPlaying,
    }))
  );
  // Selected on its own so useShallow compares the array element-by-element
  // (nested inside the object above it would be a new reference every time).
  const queue = usePortfolioStore(useShallow(computeQueue));
  const setRightSidebarMode = usePortfolioStore((s) => s.setRightSidebarMode);
  const setRightSidebarOpen = usePortfolioStore((s) => s.setRightSidebarOpen);

  return (
    <div className="spotify-scroll flex h-full flex-col overflow-y-auto text-white select-none" data-testid="queue-panel">
      <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between bg-surface px-4">
        <h2 className="text-base font-bold">Queue</h2>
        <IconButton
          label="Close"
          variant="ghost"
          onClick={
            onClose ??
            (() => {
              setRightSidebarMode('inspector');
              setRightSidebarOpen(false);
            })
          }
        >
          <CloseIcon size={16} />
        </IconButton>
      </div>
      <div className="px-2 pb-6">
        <h3 className="px-2 pb-2 text-base font-bold">Now playing</h3>
        <QueueRow track={currentTrack} contextId={contextId} current isPlaying={isPlaying} />
        <h3 className="px-2 pb-2 pt-6 text-base font-bold">
          Next from: <span className="text-white">{contextTitle}</span>
        </h3>
        {queue.length === 0 ? (
          <p className="px-2 text-sm text-subdued">Nothing else queued. Turn on repeat to start over.</p>
        ) : (
          queue.map((track) => <QueueRow key={track.id} track={track} contextId={contextId} />)
        )}
      </div>
    </div>
  );
};
