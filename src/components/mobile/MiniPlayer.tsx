import React, { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { AddCircleIcon, CheckCircleIcon, PauseIcon, PlayIcon } from '@/components/common/Icons';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { deepTone } from '@/lib/color';
import { cn } from '@/lib/utils';

const SWIPE = 60;

/**
 * Spotify's floating mini-player: 56px, tinted with the artwork colour, sitting just above
 * the tab bar. Tap opens the full player; swipe left/right skips to the next/previous item;
 * the thin line along the bottom is the progress.
 */
export const MiniPlayer: React.FC = () => {
  const { track, isPlaying, progress, saved, hidden } = usePortfolioStore(
    useShallow((s) => ({
      track: s.currentTrack,
      isPlaying: s.isPlaying,
      progress: s.progress,
      saved: s.recruiterMix.includes(s.currentTrack.id),
      hidden: s.isFullPlayerOpen || s.isSearchOpen,
    }))
  );
  const togglePlay = usePortfolioStore((s) => s.togglePlay);
  const toggleBookmark = usePortfolioStore((s) => s.toggleBookmark);
  const nextTrack = usePortfolioStore((s) => s.nextTrack);
  const prevTrack = usePortfolioStore((s) => s.prevTrack);
  const setFullPlayerOpen = usePortfolioStore((s) => s.setFullPlayerOpen);

  const start = useRef<{ x: number; y: number } | null>(null);
  const [dx, setDx] = useState(0);
  const swiped = useRef(false);

  if (hidden) return null;

  return (
    <div
      data-testid="m-mini-player"
      role="button"
      tabIndex={0}
      aria-label={`Now playing: ${track.title}. Open player`}
      onClick={() => {
        if (swiped.current) {
          swiped.current = false;
          return;
        }
        setFullPlayerOpen(true);
      }}
      onKeyDown={(e) => e.key === 'Enter' && setFullPlayerOpen(true)}
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const moveX = e.clientX - start.current.x;
        if (Math.abs(moveX) > Math.abs(e.clientY - start.current.y)) setDx(moveX);
      }}
      onPointerUp={() => {
        if (dx <= -SWIPE) nextTrack();
        else if (dx >= SWIPE) prevTrack();
        swiped.current = Math.abs(dx) >= SWIPE;
        start.current = null;
        setDx(0);
      }}
      onPointerCancel={() => {
        start.current = null;
        setDx(0);
      }}
      className="fixed inset-x-2 bottom-[calc(68px+env(safe-area-inset-bottom))] z-[61] touch-pan-y overflow-hidden rounded-md shadow-spotify-elevated md:hidden"
      style={{ backgroundColor: deepTone(track.coverColor, 0.3) }}
    >
      <div className="flex h-14 items-center gap-2 pl-2 pr-1" style={{ transform: dx ? `translateX(${dx * 0.6}px)` : undefined }}>
        <CoverArt color={track.coverColor} image={track.coverImage} kind={artKindFor(track.playlistId)} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{track.title}</p>
          <p className="truncate text-xs text-[rgba(255,255,255,0.7)]">{track.subtitle}</p>
        </div>
        <button
          type="button"
          aria-label={saved ? 'Remove from Your Recruiter Mix' : 'Save to Your Recruiter Mix'}
          aria-pressed={saved}
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(track.id);
          }}
          className={cn('flex h-11 w-11 items-center justify-center', saved ? 'text-accent' : 'text-white')}
        >
          {saved ? <CheckCircleIcon size={22} /> : <AddCircleIcon size={22} />}
        </button>
        <button
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          data-testid="m-mini-play"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="flex h-11 w-11 items-center justify-center text-white"
        >
          {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </button>
      </div>
      <div className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[rgba(255,255,255,0.3)]" aria-hidden="true">
        <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};
