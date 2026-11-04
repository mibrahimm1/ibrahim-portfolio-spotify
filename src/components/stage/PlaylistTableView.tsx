import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  CompactIcon,
  DownloadIcon,
  ListIcon,
  MoreHorizontalIcon,
  ShuffleIcon,
  UserPlusIcon,
  HeartIcon,
} from '@/components/common/Icons';
import { IconButton } from '@/components/common/IconButton';
import { PlayButton } from '@/components/common/PlayButton';
import { SpotifyButton } from '@/components/common/SpotifyButton';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { FitTitle } from '@/components/common/FitTitle';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile } from '@/data/portfolioData';
import { formatPlaylistLength, resolvePlaylist, RECRUITER_MIX_ID, TECH_PLAYLIST_PREFIX } from '@/lib/catalog';
import { deepTone } from '@/lib/color';
import { downloadResume, openMenuAt, playlistMenuItems } from '@/lib/menus';
import { StickyTopBar } from './StickyTopBar';
import { TrackList } from './TrackList';
import { useHeaderArtSize } from './StageContext';

// Spotify's Liked Songs header colour.
const RECRUITER_MIX_HEADER = '#5038a0';

export const PlaylistTableView: React.FC = () => {
  const { activeView, activePlaylistId, recruiterMix, playContextId, isPlaying, shuffle, density } = usePortfolioStore(
    useShallow((s) => ({
      activeView: s.activeView,
      activePlaylistId: s.activePlaylistId,
      recruiterMix: s.recruiterMix,
      playContextId: s.playContextId,
      isPlaying: s.isPlaying,
      shuffle: s.shuffle,
      density: s.trackListDensity,
    }))
  );
  const playTrackInContext = usePortfolioStore((s) => s.playTrackInContext);
  const togglePlay = usePortfolioStore((s) => s.togglePlay);
  const toggleShuffle = usePortfolioStore((s) => s.toggleShuffle);
  const setBookingModalOpen = usePortfolioStore((s) => s.setBookingModalOpen);
  const setTrackListDensity = usePortfolioStore((s) => s.setTrackListDensity);
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);
  const artSize = useHeaderArtSize();

  // The view is keyed off activeView so Back/Forward into the mix can never show another playlist.
  const playlistId = activeView === 'recruiter-mix' ? RECRUITER_MIX_ID : activePlaylistId;
  const isRecruiterMix = playlistId === RECRUITER_MIX_ID;
  const isTechPlaylist = playlistId.startsWith(TECH_PLAYLIST_PREFIX);
  const playlist = resolvePlaylist(playlistId, recruiterMix);
  const tracks = playlist.tracks;

  const headerColor = isRecruiterMix ? RECRUITER_MIX_HEADER : deepTone(playlist.coverColor, 0.4);
  const contextPlaying = isPlaying && playContextId === playlistId;

  const handlePlay = () => {
    if (tracks.length === 0) return;
    if (playContextId === playlistId) {
      togglePlay();
    } else {
      // Shuffle-play starts on a random track, like Spotify's green button with shuffle on.
      const first = shuffle ? tracks[Math.floor(Math.random() * tracks.length)] : tracks[0];
      playTrackInContext(first, playlistId);
    }
  };

  const typeLabel = isRecruiterMix ? 'Playlist' : isTechPlaylist ? 'Made for you' : 'Public Playlist';
  const description = isRecruiterMix
    ? 'Everything you save with + lands here, in the order you saved it. Send the mix to book an intro call.'
    : playlist.description;

  return (
    <div className="relative w-full select-none text-white">
      <StickyTopBar
        color={headerColor}
        title={playlist.title}
        isPlaying={contextPlaying}
        onPlay={tracks.length > 0 ? handlePlay : undefined}
      />

      <header
        className="relative flex min-h-[340px] items-end gap-6 px-6 pb-6 pt-20"
        style={{
          backgroundColor: headerColor,
          backgroundImage: 'linear-gradient(transparent 0, rgba(0,0,0,0.5) 100%)',
        }}
      >
        <CoverArt
          color={playlist.coverColor}
          kind={artKindFor(isTechPlaylist ? undefined : playlistId)}
          title={isRecruiterMix ? undefined : playlist.title}
          isRecruiterMix={isRecruiterMix}
          size={artSize}
          shadow
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm text-white">{typeLabel}</span>
          <FitTitle data-testid="playlist-title" className="pb-2">
            {playlist.title}
          </FitTitle>
          <p className="line-clamp-2 text-sm text-[rgba(255,255,255,0.7)]">{description}</p>
          <div className="flex flex-wrap items-center gap-1 text-sm text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#535353] text-[11px] font-bold">I</span>
            <button
              type="button"
              className="font-bold hover:underline"
              onClick={() => usePortfolioStore.getState().navigateHome()}
            >
              {candidateProfile.name}
            </button>
            <span className="text-[rgba(255,255,255,0.7)]">• {formatPlaylistLength(tracks.length)}</span>
          </div>
        </div>
      </header>

      <div
        className="relative min-h-[300px]"
        style={{
          backgroundColor: headerColor,
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6) 0, #121212 232px)',
        }}
      >
        {/* Action bar */}
        <div className="flex items-center gap-6 px-6 py-6">
          <PlayButton
            isPlaying={contextPlaying}
            label={contextPlaying ? `Pause ${playlist.title}` : `Play ${playlist.title}`}
            onClick={handlePlay}
            disabled={tracks.length === 0}
          />
          <IconButton
            label={shuffle ? 'Disable shuffle' : `Enable shuffle for ${playlist.title}`}
            active={shuffle}
            showActiveDot
            size={40}
            onClick={toggleShuffle}
          >
            <ShuffleIcon size={28} />
          </IconButton>
          <IconButton label="Download resume (PDF)" size={40} onClick={downloadResume}>
            <DownloadIcon size={28} />
          </IconButton>
          <IconButton label="Book a call on Google Meet" size={40} onClick={() => setBookingModalOpen(true)}>
            <UserPlusIcon size={26} />
          </IconButton>
          <IconButton
            label={`More options for ${playlist.title}`}
            size={40}
            onClick={(e) => openMenuAt(e, playlistMenuItems(playlistId))}
          >
            <MoreHorizontalIcon size={28} />
          </IconButton>
          <SpotifyButton
            variant="secondary"
            onClick={() => setBookingModalOpen(true)}
            data-testid="send-mix-pill-btn"
          >
            Send mix &amp; book call
          </SpotifyButton>

          <button
            type="button"
            onClick={(e) =>
              openMenuAt(e, [
                {
                  id: 'compact',
                  label: 'Compact',
                  checked: density === 'compact',
                  onSelect: () => setTrackListDensity('compact'),
                },
                {
                  id: 'list',
                  label: 'List',
                  checked: density === 'list',
                  onSelect: () => setTrackListDensity('list'),
                },
              ])
            }
            aria-label="Change track list view"
            className="ml-auto flex items-center gap-2 text-sm text-subdued hover:text-white hover:scale-104 transition-transform"
          >
            {density === 'compact' ? 'Compact' : 'List'}
            {density === 'compact' ? <CompactIcon size={16} /> : <ListIcon size={16} />}
          </button>
        </div>

        {tracks.length === 0 ? (
          <div className="flex flex-col items-center px-6 pb-16 pt-10 text-center">
            <span className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.07)] text-white">
              <HeartIcon size={32} />
            </span>
            <p className="mb-3 text-[2rem] font-black tracking-tight text-white">Projects you save will appear here</p>
            <p className="mb-8 text-base text-white">
              Save projects, roles and credentials by clicking the <span className="font-bold">+</span> icon.
            </p>
            <SpotifyButton variant="white" size="lg" onClick={() => navigateToPlaylist('featured-projects')}>
              Find projects
            </SpotifyButton>
          </div>
        ) : (
          <div className="pb-10">
            <TrackList tracks={tracks} contextId={playlistId} />
          </div>
        )}
      </div>
    </div>
  );
};
