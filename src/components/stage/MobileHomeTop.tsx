import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { allPlaylists, candidateProfile, featuredPlaylist } from '@/data/portfolioData';
import { findTrack, RECRUITER_MIX_ID } from '@/lib/catalog';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { PlayButton } from '@/components/common/PlayButton';
import { VerifiedIcon } from '@/components/common/Icons';
import { spotifyButtonClasses } from '@/components/common/SpotifyButton';
import { Track } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { TrackList } from './TrackList';

/**
 * The top of Spotify's phone Home: avatar (opens the profile menu) + filter chips, the
 * two-column grid of shortcut cards, then a compact profile card. Choosing a chip swaps
 * the rest of Home for that playlist's items. Phones only (`md:hidden`).
 */
export const MobileHomeTop: React.FC = () => {
  const { recentlyPlayed, filter, playContextId, isPlaying } = usePortfolioStore(
    useShallow((s) => ({ recentlyPlayed: s.recentlyPlayed, filter: s.homeFilter, playContextId: s.playContextId, isPlaying: s.isPlaying }))
  );
  const setFilter = usePortfolioStore((s) => s.setHomeFilter);
  const setDrawerOpen = usePortfolioStore((s) => s.setProfileDrawerOpen);
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);
  const setCurrentTrack = usePortfolioStore((s) => s.setCurrentTrack);
  const playTrackInContext = usePortfolioStore((s) => s.playTrackInContext);
  const togglePlay = usePortfolioStore((s) => s.togglePlay);
  const setBookingModalOpen = usePortfolioStore((s) => s.setBookingModalOpen);

  const playlists = allPlaylists.filter((p) => p.id !== RECRUITER_MIX_ID);
  const chips = playlists.slice(0, 3);
  const selected = playlists.find((p) => p.id === filter);

  // Recruiter Mix + sections, then recently played items: 8 shortcuts, as in the app.
  const recent = recentlyPlayed.map((id) => findTrack(id)).filter((t): t is Track => Boolean(t)).slice(0, 2);
  const shortcuts = [allPlaylists[0], ...playlists].slice(0, 8 - recent.length);
  const featuredPlaying = isPlaying && playContextId === featuredPlaylist.id;

  return (
    <div className="md:hidden" data-testid="m-home-top">
      <div className="sticky top-0 z-30 flex items-center gap-2 bg-surface px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open profile menu"
          data-testid="m-avatar"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#535353] text-sm font-bold"
        >
          {candidateProfile.avatarImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
            <img src={candidateProfile.avatarImage} alt="" className="h-full w-full object-cover" />
          ) : (
            candidateProfile.avatarLetter
          )}
        </button>
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter Home">
          {[{ id: 'all', title: 'All' }, ...chips].map((chip) => (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={filter === chip.id}
              onClick={() => setFilter(filter === chip.id && chip.id !== 'all' ? 'all' : chip.id)}
              className={cn(
                'h-8 flex-shrink-0 whitespace-nowrap rounded-full px-3 text-sm',
                filter === chip.id ? 'bg-accent text-black' : 'bg-[rgba(255,255,255,0.1)] text-white'
              )}
            >
              {chip.title}
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <section className="pt-2">
          <h2 className="px-4 pb-2 text-[22px] font-bold tracking-tight">{selected.title}</h2>
          <TrackList tracks={selected.tracks} contextId={selected.id} showHeader={false} />
        </section>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 px-4 pt-2">
            {shortcuts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => navigateToPlaylist(p.id)}
                className="flex h-14 items-center gap-2 overflow-hidden rounded bg-[rgba(255,255,255,0.1)] pr-2 text-left active:bg-[rgba(255,255,255,0.2)]"
              >
                <CoverArt color={p.coverColor} image={p.coverImage} kind={artKindFor(p.id)} isRecruiterMix={p.id === RECRUITER_MIX_ID} size={56} className="!rounded-none" />
                <span className="line-clamp-2 text-[13px] font-bold leading-tight">{p.title}</span>
              </button>
            ))}
            {recent.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCurrentTrack(t, true)}
                className="flex h-14 items-center gap-2 overflow-hidden rounded bg-[rgba(255,255,255,0.1)] pr-2 text-left active:bg-[rgba(255,255,255,0.2)]"
              >
                <CoverArt color={t.coverColor} image={t.coverImage} kind={artKindFor(t.playlistId)} size={56} className="!rounded-none" />
                <span className="line-clamp-2 text-[13px] font-bold leading-tight">{t.title}</span>
              </button>
            ))}
          </div>

          <section
            className="mx-4 mt-6 overflow-hidden rounded-lg p-4"
            style={{ backgroundColor: 'var(--banner-color)', backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.45))' }}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#282828] text-xl font-black shadow-spotify-card">
                {candidateProfile.avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
                  <img src={candidateProfile.avatarImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  candidateProfile.initials
                )}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-xs">
                  <VerifiedIcon size={16} /> {candidateProfile.verifiedLabel}
                </p>
                <h1 className="text-2xl font-bold leading-tight tracking-tight">{candidateProfile.name}</h1>
              </div>
            </div>
            <p className="mt-3 text-sm text-[rgba(255,255,255,0.85)]">{candidateProfile.tagline}</p>
            <p className="mt-1 text-xs text-[rgba(255,255,255,0.7)]">{candidateProfile.availabilityLine}</p>
            <div className="mt-4 flex items-center gap-3">
              <button type="button" onClick={() => setBookingModalOpen(true)} className={spotifyButtonClasses('white', 'sm')} data-testid="m-book-call">
                Book a call
              </button>
              <PlayButton
                size={48}
                isPlaying={featuredPlaying}
                label={featuredPlaying ? 'Pause' : `Play ${featuredPlaylist.title}`}
                className="ml-auto"
                onClick={() => (playContextId === featuredPlaylist.id ? togglePlay() : playTrackInContext(featuredPlaylist.tracks[0], featuredPlaylist.id))}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
};
