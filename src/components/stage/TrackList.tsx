import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Track } from '@/types/portfolio';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { AddCircleIcon, CheckCircleIcon, ClockIcon, MoreHorizontalIcon, PlayIcon, PauseIcon } from '@/components/common/Icons';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { Tooltip } from '@/components/common/Tooltip';
import { useStage, useStageScroll } from './StageContext';
import { openMenuAt, trackMenuItems } from '@/lib/menus';
import { cn } from '@/lib/utils';

interface TrackListProps {
  tracks: Track[];
  contextId: string;
  showHeader?: boolean;
  /** Distance of the sticky header from the top of the stage (below the sticky top bar). */
  stickyOffset?: number;
}

type Columns = 3 | 4 | 5;

function gridTemplate(columns: Columns) {
  if (columns === 5) return '[index] 16px [first] minmax(120px, 6fr) [var1] minmax(120px, 4fr) [var2] minmax(120px, 3fr) [last] minmax(120px, 1fr)';
  if (columns === 4) return '[index] 16px [first] minmax(120px, 4fr) [var1] minmax(120px, 2fr) [last] minmax(120px, 1fr)';
  return '[index] 16px [first] minmax(120px, 4fr) [last] minmax(120px, 1fr)';
}

/** Spotify track table: sticky column header, 56px rows (32px compact), select-on-click, play-on-double-click. */
export const TrackList: React.FC<TrackListProps> = ({ tracks, contextId, showHeader = true, stickyOffset = 64 }) => {
  const { width } = useStage();
  const density = usePortfolioStore((s) => s.trackListDensity);
  const columns: Columns = width >= 900 ? 5 : width >= 640 ? 4 : 3;
  const template = gridTemplate(columns);

  return (
    <div role="grid" aria-rowcount={tracks.length} className="px-6">
      {showHeader && <TrackListHeader template={template} columns={columns} stickyOffset={stickyOffset} />}
      <div role="presentation" className={cn(showHeader && 'pt-2')}>
        {tracks.map((track, idx) => (
          <TrackRow
            key={track.id}
            track={track}
            index={idx}
            contextId={contextId}
            template={template}
            columns={columns}
            compact={density === 'compact'}
          />
        ))}
      </div>
    </div>
  );
};

const TrackListHeader: React.FC<{ template: string; columns: Columns; stickyOffset: number }> = ({
  template,
  columns,
  stickyOffset,
}) => {
  const { scrollRef } = useStage();
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  useStageScroll(); // re-render on scroll so `stuck` stays current
  const container = scrollRef.current?.getBoundingClientRect();
  const sentinel = sentinelRef.current?.getBoundingClientRect();
  // Only once the header actually pins under the top bar does it get a solid background.
  const stuck = !!container && !!sentinel && sentinel.top <= container.top + stickyOffset;
  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />
      <div
        role="row"
        className={cn(
          'sticky z-20 -mx-6 border-b border-[rgba(255,255,255,0.1)] px-6 transition-colors duration-100',
          stuck && 'bg-[#1a1a1a]'
        )}
        style={{ top: stickyOffset }}
      >
        <div className="grid h-9 items-center gap-4 px-4 text-sm text-subdued" style={{ gridTemplateColumns: template }}>
          <div role="columnheader" className="text-right">#</div>
          <div role="columnheader">Title</div>
          {columns >= 4 && <div role="columnheader">Album</div>}
          {columns === 5 && <div role="columnheader">Date added</div>}
          <div role="columnheader" className="flex justify-end pr-8">
            <Tooltip label="Domain / grade">
              <ClockIcon size={16} />
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
};

interface TrackRowProps {
  track: Track;
  index: number;
  contextId: string;
  template: string;
  columns: Columns;
  compact: boolean;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index, contextId, template, columns, compact }) => {
  const { isCurrent, isPlaying, isSelected, saved } = usePortfolioStore(
    useShallow((s) => ({
      isCurrent: s.currentTrack.id === track.id,
      isPlaying: s.isPlaying,
      isSelected: s.selectedTrackId === track.id,
      saved: s.recruiterMix.includes(track.id),
    }))
  );
  const selectTrack = usePortfolioStore((s) => s.selectTrack);
  const setCurrentTrack = usePortfolioStore((s) => s.setCurrentTrack);
  const togglePlay = usePortfolioStore((s) => s.togglePlay);
  const toggleBookmark = usePortfolioStore((s) => s.toggleBookmark);
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);

  const playingHere = isCurrent && isPlaying;
  const play = () => {
    if (isCurrent) togglePlay();
    else setCurrentTrack(track, true, contextId);
  };

  return (
    <div
      role="row"
      aria-selected={isSelected}
      aria-rowindex={index + 1}
      tabIndex={0}
      onClick={() => selectTrack(track.id)}
      onDoubleClick={() => setCurrentTrack(track, true, contextId)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          setCurrentTrack(track, true, contextId);
        }
      }}
      onContextMenu={(e) => {
        selectTrack(track.id);
        openMenuAt(e, trackMenuItems(track, contextId));
      }}
      data-testid={`track-row-${track.id}`}
      className={cn(
        'group grid items-center gap-4 rounded px-4 text-sm text-subdued outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-white',
        compact ? 'h-8' : 'h-14',
        isSelected ? 'bg-[rgba(255,255,255,0.3)]' : 'hover:bg-[rgba(255,255,255,0.1)]'
      )}
      style={{ gridTemplateColumns: template }}
    >
      {/* Index / equalizer / play */}
      <div role="gridcell" className="relative flex h-4 w-4 items-center justify-end justify-self-end">
        <span className={cn('tabular-nums text-base group-hover:invisible', isSelected && 'invisible', isCurrent && 'text-accent')}>
          {playingHere ? (
            <span className="equalizer" aria-label="Now playing">
              <span />
              <span />
              <span />
              <span />
            </span>
          ) : (
            index + 1
          )}
        </span>
        <button
          type="button"
          aria-label={playingHere ? `Pause ${track.title}` : `Play ${track.title}`}
          onClick={(e) => {
            e.stopPropagation();
            play();
          }}
          className={cn(
            'absolute inset-0 flex items-center justify-end text-white invisible group-hover:visible',
            isSelected && 'visible'
          )}
        >
          {playingHere ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
        </button>
      </div>

      {/* Title */}
      <div role="gridcell" className="flex min-w-0 items-center gap-3">
        {!compact && (
          <CoverArt color={track.coverColor} image={track.coverImage} kind={artKindFor(track.playlistId)} size={40} />
        )}
        <div className="min-w-0">
          <p className={cn('truncate text-base', isCurrent ? 'text-accent' : 'text-white')} title={track.title}>
            {track.title}
          </p>
          {!compact && <p className="truncate text-sm group-hover:text-white">{track.subtitle}</p>}
        </div>
      </div>

      {columns >= 4 && (
        <div role="gridcell" className="min-w-0">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              navigateToPlaylist(track.playlistId);
            }}
            className="max-w-full truncate text-left hover:text-white hover:underline"
          >
            {track.album}
          </button>
        </div>
      )}

      {columns === 5 && (
        <div role="gridcell" className="truncate">
          {track.dateAdded}
        </div>
      )}

      {/* Save + tag + more */}
      <div role="gridcell" className="flex items-center justify-end gap-3">
        <Tooltip label={saved ? 'Remove from Your Recruiter Mix' : 'Save to Your Recruiter Mix'}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(track.id);
            }}
            data-testid={`track-bookmark-btn-${track.id.replace('project-', '').replace('work-', '')}`}
            aria-label={saved ? 'Remove from Your Recruiter Mix' : 'Save to Your Recruiter Mix'}
            aria-pressed={saved}
            className={cn(
              'flex h-4 w-4 items-center justify-center transition-transform hover:scale-104',
              saved ? 'text-accent' : 'invisible text-subdued hover:text-white group-hover:visible group-focus-within:visible',
              isSelected && 'visible'
            )}
          >
            {saved ? <CheckCircleIcon size={16} /> : <AddCircleIcon size={16} />}
          </button>
        </Tooltip>
        <span className="truncate text-right tabular-nums">{track.duration}</span>
        <button
          type="button"
          aria-label={`More options for ${track.title}`}
          onClick={(e) => openMenuAt(e, trackMenuItems(track, contextId))}
          className={cn('flex-shrink-0 invisible text-subdued hover:text-white group-hover:visible group-focus-within:visible', isSelected && 'visible')}
        >
          <MoreHorizontalIcon size={16} />
        </button>
      </div>
    </div>
  );
};
