import React from 'react';
import { AlbumIcon, CloseIcon, ExternalLinkIcon, NoteIcon, UserPlusIcon } from '@/components/common/Icons';
import { IconButton } from '@/components/common/IconButton';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile, recommenders } from '@/data/portfolioData';
import { findParentPlaylistId, findTrack } from '@/lib/catalog';

/**
 * Spotify's Friend Activity panel, repurposed for faculty endorsements:
 * avatar, name (opens the profile), what they're "listening to" (the linked
 * track) and the context line underneath.
 */
export const ListeningActivity: React.FC = () => {
  const navigateToRecommender = usePortfolioStore((s) => s.navigateToRecommender);
  const setCurrentTrack = usePortfolioStore((s) => s.setCurrentTrack);
  const setRightSidebarMode = usePortfolioStore((s) => s.setRightSidebarMode);
  const setRightSidebarOpen = usePortfolioStore((s) => s.setRightSidebarOpen);
  const setBookingModalOpen = usePortfolioStore((s) => s.setBookingModalOpen);

  return (
    <div className="spotify-scroll flex h-full flex-col overflow-y-auto text-white select-none" data-testid="friend-activity">
      <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between bg-surface px-4">
        <h2 className="text-base font-bold">Friend Activity</h2>
        <div className="flex items-center">
          <IconButton label="Book a call" variant="ghost" onClick={() => setBookingModalOpen(true)}>
            <UserPlusIcon size={16} />
          </IconButton>
          <IconButton
            label="Close"
            tooltip="Back to Now Playing"
            variant="ghost"
            onClick={() => {
              setRightSidebarMode('inspector');
              setRightSidebarOpen(false);
            }}
          >
            <CloseIcon size={16} />
          </IconButton>
        </div>
      </div>

      <ul className="space-y-1 px-2">
        {recommenders.map((rec) => {
          const linkedTrack = findTrack(rec.linkedTrackId);
          return (
            <li key={rec.id} className="flex gap-3 rounded-md p-2">
              <button
                type="button"
                onClick={() => navigateToRecommender(rec.id)}
                aria-label={`Open ${rec.name}'s profile`}
                className="relative h-10 w-10 flex-shrink-0"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#333] text-sm font-bold text-white">
                  {rec.avatarInitials}
                </span>
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface bg-[#4cb3ff]" />
              </button>
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigateToRecommender(rec.id)}
                    className="truncate font-bold text-white hover:underline"
                  >
                    {rec.name}
                  </button>
                  <a
                    href={rec.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={rec.externalLabel}
                    className="flex-shrink-0 text-subdued hover:text-white"
                  >
                    <ExternalLinkIcon size={12} />
                  </a>
                </div>
                {linkedTrack && (
                  <button
                    type="button"
                    onClick={() => setCurrentTrack(linkedTrack, true, findParentPlaylistId(linkedTrack.id))}
                    className="flex w-full min-w-0 items-center gap-1 text-left text-subdued hover:text-white"
                  >
                    <NoteIcon size={12} className="flex-shrink-0" />
                    <span className="truncate hover:underline">{linkedTrack.title}</span>
                  </button>
                )}
                <p className="flex min-w-0 items-center gap-1 text-subdued">
                  <AlbumIcon size={12} className="flex-shrink-0" />
                  <span className="truncate">{rec.ranking}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mx-4 mt-4 border-t border-[rgba(255,255,255,0.1)] pt-4 text-sm text-subdued">
        People who vouch for {candidateProfile.firstName}. Open a profile to read the full signed letter and endorsed competencies.
      </p>
    </div>
  );
};
