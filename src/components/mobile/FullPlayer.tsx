import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import {
  AddCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  DevicesIcon,
  MoreHorizontalIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  QueueIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShareIcon,
  ShuffleIcon,
} from '@/components/common/Icons';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { Slider } from '@/components/common/Slider';
import { NowPlayingCards } from '@/components/inspector/NowPlayingCards';
import { findParentPlaylistId } from '@/lib/catalog';
import { deepTone } from '@/lib/color';
import { copyToClipboard, openMenuAt, trackMenuHeader, trackMenuItems } from '@/lib/menus';
import { entryToHash } from '@/lib/routing';
import { cn, formatSecondsToTime } from '@/lib/utils';

const CLOSE_DISTANCE = 120;

const RoundButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; dot?: boolean }> = ({
  active,
  dot,
  className,
  children,
  ...props
}) => (
  <button
    type="button"
    className={cn('relative flex h-12 w-12 items-center justify-center', active ? 'text-accent' : 'text-white', className)}
    {...props}
  >
    {children}
    {active && dot && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />}
  </button>
);

/**
 * Spotify's full-screen Now Playing on phones: slides up from the mini-player, tinted with
 * the artwork colour, big artwork, scrubber with a visible knob, large transport, then the
 * same cards as the desktop Now Playing view. Swipe down (or Back) to close.
 */
export const FullPlayer: React.FC = () => {
  const s = usePortfolioStore(
    useShallow((state) => ({
      open: state.isFullPlayerOpen,
      track: state.currentTrack,
      contextTitle: state.currentPlaylist.title,
      contextId: state.playContextId,
      isPlaying: state.isPlaying,
      progress: state.progress,
      current: state.currentTimeSeconds,
      duration: state.durationSeconds,
      shuffle: state.shuffle,
      repeat: state.repeat,
      saved: state.recruiterMix.includes(state.currentTrack.id),
    }))
  );
  const a = usePortfolioStore(
    useShallow((state) => ({
      setFullPlayerOpen: state.setFullPlayerOpen,
      togglePlay: state.togglePlay,
      next: state.nextTrack,
      prev: state.prevTrack,
      setProgress: state.setProgress,
      toggleShuffle: state.toggleShuffle,
      cycleRepeat: state.cycleRepeat,
      toggleBookmark: state.toggleBookmark,
      toggleLyrics: state.toggleLyrics,
      navigateToPlaylist: state.navigateToPlaylist,
      setQueueSheetOpen: state.setQueueSheetOpen,
    }))
  );
  const close = () => a.setFullPlayerOpen(false);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (s.open) scrollRef.current?.scrollTo({ top: 0 });
  }, [s.open]);

  if (!s.open) return null;

  const { track } = s;
  const tone = deepTone(track.coverColor, 0.35);

  const dragHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if ((scrollRef.current?.scrollTop ?? 0) > 0) return; // only drag from the top of the sheet
      start.current = e.clientY;
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (start.current === null) return;
      setDrag(Math.max(0, e.clientY - start.current));
    },
    onPointerUp: () => {
      if (start.current === null) return;
      start.current = null;
      if (drag > CLOSE_DISTANCE) close();
      setDrag(0);
    },
    onPointerCancel: () => {
      start.current = null;
      setDrag(0);
    },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Now playing"
      data-testid="m-full-player"
      className="fixed inset-0 z-[70] flex flex-col text-white animate-sheet-in md:hidden"
      style={{
        background: `linear-gradient(180deg, ${tone} 0%, #121212 75%)`,
        transform: drag ? `translateY(${drag}px)` : undefined,
        transition: drag ? 'none' : 'transform 220ms cubic-bezier(0.3,0,0,1)',
      }}
    >
      {/* Header (also the drag handle) */}
      <div {...dragHandlers} className="flex flex-shrink-0 touch-none items-center gap-2 px-3 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
        <RoundButton aria-label="Close player" data-testid="m-full-player-close" onClick={close}>
          <ChevronLeftIcon size={20} className="-rotate-90" />
        </RoundButton>
        <button
          type="button"
          onClick={() => {
            close();
            a.navigateToPlaylist(s.contextId);
          }}
          className="min-w-0 flex-1 text-center"
        >
          <span className="block text-[11px] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.7)]">Playing from playlist</span>
          <span className="block truncate text-[13px] font-bold">{s.contextTitle}</span>
        </button>
        <RoundButton aria-label="More options" onClick={(e) => openMenuAt(e, trackMenuItems(track, s.contextId), trackMenuHeader(track))}>
          <MoreHorizontalIcon size={20} />
        </RoundButton>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-[max(24px,env(safe-area-inset-bottom))]">
        <div {...dragHandlers} className="touch-pan-x pt-4">
          <CoverArt
            color={track.coverColor}
            image={track.coverImage}
            kind={artKindFor(track.playlistId)}
            title={track.title}
            className="mx-auto aspect-square w-full max-w-[420px]"
            rounded="md"
            shadow
          />
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[22px] font-bold leading-tight">{track.title}</h2>
            <p className="truncate text-base text-[rgba(255,255,255,0.7)]">{track.subtitle}</p>
          </div>
          <RoundButton
            aria-label={s.saved ? 'Remove from Your Recruiter Mix' : 'Save to Your Recruiter Mix'}
            aria-pressed={s.saved}
            active={s.saved}
            onClick={() => a.toggleBookmark(track.id)}
          >
            {s.saved ? <CheckCircleIcon size={26} /> : <AddCircleIcon size={26} />}
          </RoundButton>
        </div>

        <div className="mt-4">
          <Slider
            value={s.progress}
            onChange={a.setProgress}
            label="Change progress"
            valueText={`${formatSecondsToTime(s.current)} of ${formatSecondsToTime(s.duration)}`}
            alwaysShowKnob
            className="h-6"
          />
          <div className="mt-1 flex justify-between text-[11px] tabular-nums text-[rgba(255,255,255,0.7)]">
            <span>{formatSecondsToTime(s.current)}</span>
            <span>{formatSecondsToTime(s.duration)}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <RoundButton aria-label={s.shuffle ? 'Disable shuffle' : 'Enable shuffle'} aria-pressed={s.shuffle} active={s.shuffle} dot onClick={a.toggleShuffle}>
            <ShuffleIcon size={24} />
          </RoundButton>
          <RoundButton aria-label="Previous" onClick={a.prev}>
            <PrevIcon size={30} />
          </RoundButton>
          <button
            type="button"
            aria-label={s.isPlaying ? 'Pause' : 'Play'}
            data-testid="m-full-play"
            onClick={a.togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform active:scale-95"
          >
            {s.isPlaying ? <PauseIcon size={28} /> : <PlayIcon size={28} className="ml-1" />}
          </button>
          <RoundButton aria-label="Next" onClick={() => a.next()}>
            <NextIcon size={30} />
          </RoundButton>
          <RoundButton
            aria-label={s.repeat === 'off' ? 'Enable repeat' : s.repeat === 'context' ? 'Enable repeat one' : 'Disable repeat'}
            active={s.repeat !== 'off'}
            dot
            onClick={a.cycleRepeat}
          >
            {s.repeat === 'track' ? <RepeatOneIcon size={24} /> : <RepeatIcon size={24} />}
          </RoundButton>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <RoundButton aria-label="Connect to a device" className="text-[rgba(255,255,255,0.7)]">
            <DevicesIcon size={20} />
          </RoundButton>
          <div className="flex">
            <RoundButton
              aria-label="Share"
              onClick={() =>
                copyToClipboard(
                  `${window.location.origin}${window.location.pathname}${entryToHash({ view: 'playlist', playlistId: findParentPlaylistId(track.id) })}`,
                  'Link copied to clipboard'
                )
              }
            >
              <ShareIcon size={20} />
            </RoundButton>
            <RoundButton aria-label="Queue" onClick={() => a.setQueueSheetOpen(true)}>
              <QueueIcon size={20} />
            </RoundButton>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <NowPlayingCards
            tone="overlay"
            onOpenQueue={() => a.setQueueSheetOpen(true)}
            onShowLyrics={() => {
              close();
              a.toggleLyrics();
            }}
          />
        </div>
      </div>
    </div>
  );
};
