import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { SpotifyButton } from '@/components/common/SpotifyButton';
import { PlayButton } from '@/components/common/PlayButton';
import { IconButton } from '@/components/common/IconButton';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { FitTitle } from '@/components/common/FitTitle';
import { DownloadIcon, MoreHorizontalIcon, SettingsIcon, VerifiedIcon } from '@/components/common/Icons';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile, technologyAvatars, allPlaylists, recommenders, featuredProjectsTracks } from '@/data/portfolioData';
import { buildTechPlaylist, RECRUITER_MIX_ID, TECH_PLAYLIST_PREFIX } from '@/lib/catalog';
import { downloadResume, openMenuAt, playlistMenuItems } from '@/lib/menus';
import { StickyTopBar } from './StickyTopBar';
import { Shelf } from './Shelf';
import { MediaCard } from './MediaCard';
import { TrackList } from './TrackList';
import { useHeaderArtSize, useStage } from './StageContext';

const HEADER_COLOR = 'var(--banner-color)';

export const HomeProfileView: React.FC = () => {
  const { playContextId, isPlaying } = usePortfolioStore(
    useShallow((s) => ({ playContextId: s.playContextId, isPlaying: s.isPlaying }))
  );
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);
  const navigateToRecommender = usePortfolioStore((s) => s.navigateToRecommender);
  const playTrackInContext = usePortfolioStore((s) => s.playTrackInContext);
  const togglePlay = usePortfolioStore((s) => s.togglePlay);
  const setBookingModalOpen = usePortfolioStore((s) => s.setBookingModalOpen);
  const setThemeModalOpen = usePortfolioStore((s) => s.setThemeModalOpen);
  const setShortcutsModalOpen = usePortfolioStore((s) => s.setShortcutsModalOpen);
  const { width } = useStage();
  const artSize = useHeaderArtSize();

  const publicPlaylists = allPlaylists.filter((p) => p.id !== RECRUITER_MIX_ID);
  const profilePlaying = isPlaying && playContextId === 'featured-projects';

  // The profile "Play" starts the guided tour through Featured Projects.
  const playProfile = () => {
    if (playContextId === 'featured-projects') togglePlay();
    else playTrackInContext(featuredProjectsTracks[0], 'featured-projects');
  };

  const playContext = (contextId: string, firstTrack: (typeof featuredProjectsTracks)[number] | undefined) => {
    if (!firstTrack) return;
    if (playContextId === contextId) togglePlay();
    else playTrackInContext(firstTrack, contextId);
  };

  return (
    <div className="relative w-full select-none" data-testid="home-profile-view">
      <StickyTopBar
        color={HEADER_COLOR}
        title={candidateProfile.name}
        isPlaying={profilePlaying}
        onPlay={playProfile}
      />

      {/* Profile header */}
      <header
        className="relative flex min-h-[340px] items-end gap-6 px-6 pb-6 pt-20"
        style={{
          backgroundColor: HEADER_COLOR,
          backgroundImage: 'linear-gradient(transparent 0, rgba(0,0,0,0.5) 100%)',
        }}
      >
        <div
          className="flex flex-shrink-0 items-center justify-center rounded-full bg-[#282828] shadow-spotify-art"
          style={{ width: artSize, height: artSize }}
        >
          <span className="font-black tracking-tighter text-white" style={{ fontSize: artSize * 0.31 }}>
            MIS
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex items-center gap-2 text-sm text-white">
            <VerifiedIcon size={24} />
            Verified Engineer
          </span>
          <FitTitle className="pb-2">{candidateProfile.name}</FitTitle>
          <p className="text-sm text-white">
            {candidateProfile.tagline}
          </p>
        </div>
      </header>

      {/* Body sits on a darkened wash of the header colour, as on every Spotify page */}
      <div
        className="relative"
        style={{
          backgroundColor: HEADER_COLOR,
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6) 0, #121212 232px)',
        }}
      >
        <div className="flex items-center gap-6 px-6 py-6">
          <PlayButton isPlaying={profilePlaying} label={profilePlaying ? 'Pause' : 'Play Featured Projects'} onClick={playProfile} />
          <SpotifyButton
            variant="secondary"
            onClick={() => setBookingModalOpen(true)}
            data-testid="home-book-call-btn"
          >
            Book a call
          </SpotifyButton>
          <SpotifyButton variant="secondary" onClick={downloadResume}>
            <DownloadIcon size={16} />
            Download resume
          </SpotifyButton>
          <IconButton
            label="Change accent colour"
            onClick={() => setThemeModalOpen(true)}
            data-testid="settings-gear-btn"
          >
            <SettingsIcon size={24} />
          </IconButton>
          <IconButton
            label={`More options for ${candidateProfile.name}`}
            onClick={(e) =>
              openMenuAt(e, [
                { id: 'theme', label: 'Change accent colour', onSelect: () => setThemeModalOpen(true) },
                { id: 'shortcuts', label: 'Keyboard shortcuts', onSelect: () => setShortcutsModalOpen(true) },
                {
                  id: 'resume',
                  label: 'Open standard resume view',
                  dividerBefore: true,
                  onSelect: () => {
                    window.location.href = '/resume';
                  },
                },
                { id: 'github', label: 'GitHub', external: true, onSelect: () => window.open(candidateProfile.github, '_blank', 'noopener,noreferrer') },
                { id: 'linkedin', label: 'LinkedIn', external: true, onSelect: () => window.open(candidateProfile.linkedin, '_blank', 'noopener,noreferrer') },
              ])
            }
          >
            <MoreHorizontalIcon size={24} />
          </IconButton>
          {width >= 1000 && (
            <span className="ml-auto whitespace-nowrap text-sm text-subdued">Open to remote • Full-time roles • 2027 grad</span>
          )}
        </div>

        <Shelf
          title="Top artists this month"
          subtitle="The core stack behind every production system"
          itemCount={technologyAvatars.length}
          testId="shelf-top-artists"
        >
          {technologyAvatars.map((tech) => {
            const contextId = `${TECH_PLAYLIST_PREFIX}${tech.id}`;
            const firstTrack = buildTechPlaylist(tech.id)?.tracks[0];
            return (
              <MediaCard
                key={tech.id}
                circular
                title={tech.name}
                subtitle={tech.category}
                isPlaying={isPlaying && playContextId === contextId}
                onOpen={() => navigateToPlaylist(contextId)}
                onPlay={() => playContext(contextId, firstTrack)}
                art={
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full text-[2.5rem] font-black tracking-tighter"
                    style={{ backgroundColor: tech.color, color: 'rgba(0,0,0,0.75)' }}
                  >
                    {tech.monogram}
                  </div>
                }
              />
            );
          })}
        </Shelf>

        <section className="pt-8">
          <div className="mb-2 flex items-end justify-between px-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Top tracks this month</h2>
              <p className="text-sm text-subdued">The projects recruiters open most</p>
            </div>
            <button
              type="button"
              onClick={() => navigateToPlaylist('featured-projects')}
              className="pb-1 text-sm font-bold text-subdued hover:underline"
            >
              Show all
            </button>
          </div>
          <TrackList tracks={featuredProjectsTracks.slice(0, 4)} contextId="featured-projects" showHeader={false} />
        </section>

        <Shelf title="Public Playlists" itemCount={publicPlaylists.length} className="pt-8">
          {publicPlaylists.map((playlist) => (
            <MediaCard
              key={playlist.id}
              testId={`home-playlist-card-${playlist.id}`}
              title={playlist.title}
              subtitle={playlist.description}
              isPlaying={isPlaying && playContextId === playlist.id}
              onOpen={() => navigateToPlaylist(playlist.id)}
              onPlay={() => playContext(playlist.id, playlist.tracks[0])}
              onContextMenu={(e) => openMenuAt(e, playlistMenuItems(playlist.id))}
              art={
                <CoverArt
                  color={playlist.coverColor}
                  kind={artKindFor(playlist.id)}
                  title={playlist.title}
                  rounded="md"
                  className="h-full w-full"
                />
              }
            />
          ))}
        </Shelf>

        <Shelf title="Following" subtitle="Faculty who vouch for Ibrahim" itemCount={recommenders.length} className="pt-8 pb-2">
          {recommenders.map((rec) => (
            <MediaCard
              key={rec.id}
              circular
              title={rec.name}
              subtitle="Profile"
              onOpen={() => navigateToRecommender(rec.id)}
              art={
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#333] text-[2.5rem] font-black tracking-tighter text-white">
                  {rec.avatarInitials}
                </div>
              }
            />
          ))}
        </Shelf>
      </div>
    </div>
  );
};
