import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ExternalLinkIcon, PlayIcon } from '@/components/common/Icons';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { spotifyButtonClasses } from '@/components/common/SpotifyButton';
import { usePortfolioStore, computeQueue } from '@/stores/usePortfolioStore';
import { allPlaylists, recommenders } from '@/data/portfolioData';
import { deepTone } from '@/lib/color';
import { cn } from '@/lib/utils';

interface NowPlayingCardsProps {
  /** Desktop opens the Queue panel; phones open the queue sheet. */
  onOpenQueue: () => void;
  /** Desktop toggles Lyrics; phones also close the full player first. */
  onShowLyrics: () => void;
  /** Card background on top of the full player's gradient vs. the #121212 side panel. */
  tone?: 'panel' | 'overlay';
}

/**
 * The stacked cards under the artwork in Spotify's Now Playing view (desktop right panel)
 * and the full-screen mobile player: Lyrics preview → About → Credits → Next in queue.
 */
export const NowPlayingCards: React.FC<NowPlayingCardsProps> = ({ onOpenQueue, onShowLyrics, tone = 'panel' }) => {
  const { currentTrack, contextId, nextUp } = usePortfolioStore(
    useShallow((s) => ({ currentTrack: s.currentTrack, contextId: s.playContextId, nextUp: computeQueue(s)[0] }))
  );
  const navigateToRecommender = usePortfolioStore((s) => s.navigateToRecommender);
  const setCurrentTrack = usePortfolioStore((s) => s.setCurrentTrack);
  const [creditsExpanded, setCreditsExpanded] = useState(false);

  const recommender = recommenders.find((r) => r.id === currentTrack.recommenderId);
  const credits = creditsExpanded ? currentTrack.credits : currentTrack.credits.slice(0, 3);
  const card = tone === 'overlay' ? 'bg-[rgba(0,0,0,0.3)]' : 'bg-[rgba(255,255,255,0.07)]';

  return (
    <>
      {/* Highlights: Spotify's colour-washed "Lyrics preview" card */}
      <section className="overflow-hidden rounded-lg p-4" style={{ backgroundColor: deepTone(currentTrack.coverColor, 0.4) }}>
        <h3 className="mb-3 text-base font-bold">Highlights</h3>
        <p className="select-text text-xl font-bold leading-snug">{currentTrack.hook}</p>
        <button type="button" onClick={onShowLyrics} className={cn(spotifyButtonClasses('white', 'sm'), 'mt-4')}>
          Show cover letter
        </button>
      </section>

      {/* About */}
      <section className={cn('overflow-hidden rounded-lg', card)}>
        <div className="relative h-[180px]">
          <CoverArt
            color={currentTrack.coverColor}
            image={currentTrack.coverImage}
            kind={artKindFor(currentTrack.playlistId)}
            rounded="sm"
            className="absolute inset-0 h-full w-full !rounded-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.55)] to-transparent" />
          <p className="absolute left-4 top-4 text-base font-bold">
            {allPlaylists.find((p) => p.id === currentTrack.playlistId)?.aboutLabel ?? 'About'}
          </p>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
      <section className={cn('rounded-lg p-4', card)}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold">Credits</h3>
          {currentTrack.credits.length > 3 && (
            <button type="button" onClick={() => setCreditsExpanded((v) => !v)} className="text-sm font-bold text-subdued hover:text-white hover:underline">
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
      <section className={cn('rounded-lg p-4', card)}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-bold">Next in queue</h3>
          <button type="button" onClick={onOpenQueue} className="text-sm font-bold text-subdued hover:text-white hover:underline">
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
              <CoverArt color={nextUp.coverColor} image={nextUp.coverImage} kind={artKindFor(nextUp.playlistId)} size={48} />
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
    </>
  );
};
