import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  PlayIcon,
  PauseIcon,
  PrevIcon,
  NextIcon,
  ShuffleIcon,
  RepeatIcon,
  RepeatOneIcon,
  MicIcon,
  QueueIcon,
  AddCircleIcon,
  CheckCircleIcon,
  NowPlayingViewIcon,
  DevicesIcon,
  FullscreenIcon,
  VolumeIcon,
} from '@/components/common/Icons';
import { IconButton } from '@/components/common/IconButton';
import { Tooltip } from '@/components/common/Tooltip';
import { Slider } from '@/components/common/Slider';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { findParentPlaylistId } from '@/lib/catalog';
import { openMenuAt, trackMenuItems, trackMenuHeader } from '@/lib/menus';
import { formatSecondsToTime, cn } from '@/lib/utils';

export const BottomPlayerBar: React.FC = () => {
  const s = usePortfolioStore(
    useShallow((state) => ({
      currentTrack: state.currentTrack,
      playContextId: state.playContextId,
      isPlaying: state.isPlaying,
      progress: state.progress,
      currentTimeSeconds: state.currentTimeSeconds,
      durationSeconds: state.durationSeconds,
      shuffle: state.shuffle,
      repeat: state.repeat,
      volume: state.volume,
      isMuted: state.isMuted,
      activeView: state.activeView,
      isRightSidebarOpen: state.isRightSidebarOpen,
      rightSidebarMode: state.rightSidebarMode,
      saved: state.recruiterMix.includes(state.currentTrack.id),
    }))
  );
  const actions = usePortfolioStore(
    useShallow((state) => ({
      togglePlay: state.togglePlay,
      setProgress: state.setProgress,
      nextTrack: state.nextTrack,
      prevTrack: state.prevTrack,
      toggleShuffle: state.toggleShuffle,
      cycleRepeat: state.cycleRepeat,
      setVolume: state.setVolume,
      toggleMute: state.toggleMute,
      toggleBookmark: state.toggleBookmark,
      toggleLyrics: state.toggleLyrics,
      toggleRightSidebar: state.toggleRightSidebar,
      setRightSidebarOpen: state.setRightSidebarOpen,
      setRightSidebarMode: state.setRightSidebarMode,
      navigateToPlaylist: state.navigateToPlaylist,
    }))
  );

  const { currentTrack } = s;
  const nowPlayingOpen = s.isRightSidebarOpen && s.rightSidebarMode === 'inspector';
  const queueOpen = s.isRightSidebarOpen && s.rightSidebarMode === 'queue';
  const lyricsOpen = s.activeView === 'lyrics';
  const repeatLabel = s.repeat === 'off' ? 'Enable repeat' : s.repeat === 'context' ? 'Enable repeat one' : 'Disable repeat';
  const effectiveVolume = s.isMuted ? 0 : s.volume;

  const openPanel = (mode: 'inspector' | 'queue') => {
    if (s.isRightSidebarOpen && s.rightSidebarMode === mode) {
      actions.setRightSidebarOpen(false);
    } else {
      actions.setRightSidebarMode(mode);
      actions.setRightSidebarOpen(true);
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  return (
    <footer
      data-testid="bottom-player-bar"
      aria-label="Now playing bar"
      className="z-40 flex h-[72px] w-full flex-shrink-0 items-center justify-between bg-black px-2 text-white select-none"
    >
      {/* Left: artwork + metadata + save */}
      <div className="flex w-[30%] min-w-[180px] items-center gap-3 pl-2">
        <Tooltip label={nowPlayingOpen ? 'Hide Now Playing view' : 'Show Now Playing view'}>
          <button
            type="button"
            onClick={() => openPanel('inspector')}
            onContextMenu={(e) => openMenuAt(e, trackMenuItems(currentTrack, s.playContextId), trackMenuHeader(currentTrack))}
            aria-label="Inspect track details"
            className="group relative"
          >
            <CoverArt color={currentTrack.coverColor} image={currentTrack.coverImage} kind={artKindFor(currentTrack.playlistId)} size={56} />
          </button>
        </Tooltip>

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => actions.navigateToPlaylist(findParentPlaylistId(currentTrack.id))}
            onContextMenu={(e) => openMenuAt(e, trackMenuItems(currentTrack, s.playContextId), trackMenuHeader(currentTrack))}
            className="block max-w-full truncate text-left text-sm text-white hover:underline"
            title={currentTrack.title}
          >
            {currentTrack.title}
          </button>
          <p className="truncate text-xs text-subdued">{currentTrack.subtitle}</p>
        </div>

        <IconButton
          label={s.saved ? 'Remove from Your Recruiter Mix' : 'Save to Your Recruiter Mix'}
          active={s.saved}
          onClick={() => actions.toggleBookmark(currentTrack.id)}
          aria-pressed={s.saved}
          className="ml-1"
        >
          {s.saved ? <CheckCircleIcon size={16} /> : <AddCircleIcon size={16} />}
        </IconButton>
      </div>

      {/* Centre: transport + scrubber */}
      <div className="flex w-[40%] max-w-[722px] flex-col items-center gap-2 pt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconButton
              label={s.shuffle ? 'Disable shuffle' : 'Enable shuffle'}
              active={s.shuffle}
              showActiveDot
              onClick={actions.toggleShuffle}
              aria-pressed={s.shuffle}
            >
              <ShuffleIcon size={16} />
            </IconButton>
            <IconButton label="Previous" onClick={actions.prevTrack}>
              <PrevIcon size={16} />
            </IconButton>
          </div>

          <Tooltip label={s.isPlaying ? 'Pause' : 'Play'}>
            <button
              type="button"
              onClick={actions.togglePlay}
              aria-label={s.isPlaying ? 'Pause' : 'Play'}
              data-testid="bottom-play-btn"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform duration-100 hover:scale-104 active:scale-100"
            >
              {s.isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
            </button>
          </Tooltip>

          <div className="flex items-center gap-2">
            <IconButton label="Next" onClick={() => actions.nextTrack()}>
              <NextIcon size={16} />
            </IconButton>
            <IconButton
              label={repeatLabel}
              active={s.repeat !== 'off'}
              showActiveDot
              onClick={actions.cycleRepeat}
            >
              {s.repeat === 'track' ? <RepeatOneIcon size={16} /> : <RepeatIcon size={16} />}
            </IconButton>
          </div>
        </div>

        <div className="flex w-full items-center gap-2">
          <span className="min-w-[40px] text-right text-xs tabular-nums text-subdued">
            {formatSecondsToTime(s.currentTimeSeconds)}
          </span>
          <Slider
            value={s.progress}
            onChange={actions.setProgress}
            label="Change progress"
            valueText={`${formatSecondsToTime(s.currentTimeSeconds)} of ${formatSecondsToTime(s.durationSeconds)}`}
            className="flex-1"
            testId="playback-progress"
          />
          <span className="min-w-[40px] text-left text-xs tabular-nums text-subdued">
            {formatSecondsToTime(s.durationSeconds)}
          </span>
        </div>
      </div>

      {/* Right: utility controls */}
      <div className="flex w-[30%] min-w-[180px] items-center justify-end gap-1 pr-2">
        <IconButton
          label={nowPlayingOpen ? 'Hide Now Playing view' : 'Now playing view'}
          active={nowPlayingOpen}
          showActiveDot
          onClick={() => openPanel('inspector')}
          data-testid="toggle-now-playing-btn"
        >
          <NowPlayingViewIcon size={16} />
        </IconButton>
        <IconButton
          label="Open Personal Cover Letter Lyrics Mode"
          tooltip="Lyrics: personal cover letter"
          active={lyricsOpen}
          showActiveDot
          onClick={actions.toggleLyrics}
          data-testid="lyrics-mic-btn"
          aria-pressed={lyricsOpen}
        >
          <MicIcon size={16} />
        </IconButton>
        <IconButton label="Queue" active={queueOpen} showActiveDot onClick={() => openPanel('queue')}>
          <QueueIcon size={16} />
        </IconButton>
        <IconButton
          label="Connect to a device"
          onClick={(e) =>
            openMenuAt(e, [
              { id: 'this', label: 'This web browser', checked: true, onSelect: () => {} },
              {
                id: 'resume',
                label: 'Standard resume view',
                onSelect: () => {
                  window.location.href = '/resume';
                },
              },
            ])
          }
        >
          <DevicesIcon size={16} />
        </IconButton>
        <div className="flex w-[125px] items-center">
          <IconButton label={s.isMuted || s.volume === 0 ? 'Unmute' : 'Mute'} onClick={actions.toggleMute}>
            <VolumeIcon size={16} level={effectiveVolume} muted={s.isMuted} />
          </IconButton>
          <Slider
            value={effectiveVolume}
            onChange={actions.setVolume}
            label="Change volume"
            valueText={`${effectiveVolume}%`}
            className="flex-1"
            testId="volume-slider"
          />
        </div>
        <IconButton label="Full screen" onClick={toggleFullscreen} className={cn('hidden xl:inline-flex')}>
          <FullscreenIcon size={16} />
        </IconButton>
      </div>
    </footer>
  );
};
