import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  AddCircleIcon,
  CheckCircleIcon,
  CloseIcon,
  ExternalLinkIcon,
  FriendsIcon,
  MoreHorizontalIcon,
  PlayIcon,
  ShareIcon,
} from '@/components/common/Icons';
import { IconButton } from '@/components/common/IconButton';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { spotifyButtonClasses } from '@/components/common/SpotifyButton';
import { usePortfolioStore, computeQueue } from '@/stores/usePortfolioStore';
import { recommenders } from '@/data/portfolioData';
import { findParentPlaylistId } from '@/lib/catalog';
import { deepTone } from '@/lib/color';
import { copyToClipboard, openMenuAt, trackMenuItems } from '@/lib/menus';
import { entryToHash } from '@/lib/routing';
import { cn } from '@/lib/utils';

const ABOUT_LABEL: Record<string, string> = {
  'featured-projects': 'About the project',
  'work-experience': 'About the role',
  education: 'About the program',
  'research-publications': 'About the paper',
  'volunteering-leadership': 'About the role',
  'certifications-honors': 'About the award',
};

/** Spotify's Now Playing View: sticky header, big artwork, then stacked cards. */
export const NowPlayingInspector: React.FC = () => {
  const { currentTrack, contextTitle, contextId, saved, nextUp } = usePortfolioStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      contextTitle: s.currentPlaylist.title,
      contextId: s.playContextId,
      saved: s.recruiterMix.includes(s.currentTrack.id),
      nextUp: computeQueue(s)[0],
    }))
  );
  const toggleBookmark = usePortfolioStore((s) => s.toggleBookmark);
  const navigateToRecommender = usePortfolioStore((s) => s.navigateToRecommender);
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);
  const setRightSidebarMode = usePortfolioStore((s) => s.setRightSidebarMode);
  const setRightSidebarOpen = usePortfolioStore((s) => s.setRightSidebarOpen);
  const setCurrentTrack = usePortfolioStore((s) => s.setCurrentTrack);
  const toggleLyrics = usePortfolioStore((s) => s.toggleLyrics);
  const [creditsExpanded, setCreditsExpanded] = useState(false);

  const recommender = recommenders.find((r) => r.id === currentTrack.recommenderId);
  const parentId = findParentPlaylistId(currentTrack.id);
  const credits = creditsExpanded ? currentTrack.credits : currentTrack.credits.slice(0, 3);
  const cardTone = deepTone(currentTrack.coverColor, 0.4);

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
            onClick={(e) => openMenuAt(e, trackMenuItems(currentTrack, contextId))}
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
          color={currentTrack.coverColor}
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

        {/* Highlights: Spotify's colour-washed "Lyrics preview" card */}
        <section className="overflow-hidden rounded-lg p-4" style={{ backgroundColor: cardTone }}>
          <h3 className="mb-3 text-base font-bold">Highlights</h3>
          <p className="select-text text-xl font-bold leading-snug">{currentTrack.hook}</p>
          <button
            type="button"
            onClick={toggleLyrics}
            className={cn(spotifyButtonClasses('white', 'sm'), 'mt-4')}
          >
            Show cover letter
          </button>
        </section>

        {/* About */}
        <section className="overflow-hidden rounded-lg bg-[rgba(255,255,255,0.07)]">
          <div className="relative h-[180px]">
            <CoverArt
              color={currentTrack.coverColor}
              kind={artKindFor(currentTrack.playlistId)}
              rounded="sm"
              className="absolute inset-0 h-full w-full !rounded-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.55)] to-transparent" />
            <p className="absolute left-4 top-4 text-base font-bold">
              {ABOUT_LABEL[currentTrack.playlistId] ?? 'About'}
            </p>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 text-base font-bold">{currentTrack.duration}</p>
              <div className="flex flex-shrink-0 gap-2">
                {currentTrack.demoUrl && (
                  <a href={currentTrack.demoUrl} target="_blank" rel="noopener noreferrer" className={spotifyButtonClasses('secondary')}>
                    Live demo <ExternalLinkIcon size={12} />
                  </a>
                )}
                {currentTrack.externalUrl && (
                  <a href={currentTrack.externalUrl} target="_blank" rel="noopener noreferrer" className={spotifyButtonClasses('secondary')}>
                    {currentTrack.externalUrl.includes('doi.org') ? 'DOI' : 'Code'} <ExternalLinkIcon size={12} />
                  </a>
                )}
              </div>
            </div>
            <p className="select-text text-sm leading-relaxed text-subdued">{currentTrack.details}</p>
            {recommender && (
              <button
                type="button"
                onClick={() => navigateToRecommender(recommender.id)}
                className="flex w-full items-center gap-3 rounded-md bg-[rgba(255,255,255,0.07)] p-2 text-left transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#333] text-sm font-bold">
                  {recommender.avatarInitials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">Vouched for by {recommender.name}</span>
                  <span className="block truncate text-xs text-subdued">Read the recommendation letter</span>
                </span>
              </button>
            )}
          </div>
        </section>

        {/* Credits */}
        <section className="rounded-lg bg-[rgba(255,255,255,0.07)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold">Credits</h3>
            {currentTrack.credits.length > 3 && (
              <button
                type="button"
                onClick={() => setCreditsExpanded((v) => !v)}
                className="text-sm font-bold text-subdued hover:text-white hover:underline"
              >
                {creditsExpanded ? 'Show less' : 'Show all'}
              </button>
            )}
          </div>
          <ul className="space-y-3">
            {credits.map((credit) => (
              <li key={credit.item}>
                <p className="text-base text-white">{credit.item}</p>
                <p className="text-sm text-subdued">{credit.role}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Next in queue */}
        <section className="rounded-lg bg-[rgba(255,255,255,0.07)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-bold">Next in queue</h3>
            <button
              type="button"
              onClick={() => setRightSidebarMode('queue')}
              className="text-sm font-bold text-subdued hover:text-white hover:underline"
            >
              Open queue
            </button>
          </div>
          {nextUp ? (
            <button
              type="button"
              onClick={() => setCurrentTrack(nextUp, true, contextId)}
              className="group -mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-[rgba(255,255,255,0.1)]"
            >
              <span className="relative">
                <CoverArt color={nextUp.coverColor} kind={artKindFor(nextUp.playlistId)} size={48} />
                <span className="absolute inset-0 hidden items-center justify-center rounded bg-[rgba(0,0,0,0.5)] group-hover:flex">
                  <PlayIcon size={16} />
                </span>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base text-white">{nextUp.title}</span>
                <span className="block truncate text-sm text-subdued">{nextUp.subtitle}</span>
              </span>
            </button>
          ) : (
            <p className="text-sm text-subdued">That&apos;s the end of this playlist. Turn on repeat to keep going.</p>
          )}
        </section>
      </div>
    </div>
  );
};
