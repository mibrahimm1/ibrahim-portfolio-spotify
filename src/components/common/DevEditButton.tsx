import React from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { TECH_PLAYLIST_PREFIX } from '@/lib/catalog';

/** Dashboard deep link for whatever the page is showing. */
export function dashboardLinkFor(view: string, playlistId: string, recommenderId: string | null) {
  if (view === 'playlist' && playlistId.startsWith(TECH_PLAYLIST_PREFIX)) {
    return `/dashboard#technology/${encodeURIComponent(playlistId.slice(TECH_PLAYLIST_PREFIX.length))}`;
  }
  if (view === 'playlist') return `/dashboard#playlist/${encodeURIComponent(playlistId)}`;
  if (view === 'recommender' && recommenderId) return `/dashboard#recommender/${encodeURIComponent(recommenderId)}`;
  if (view === 'lyrics') return '/dashboard#coverLetter';
  if (view === 'recruiter-mix') return '/dashboard#home';
  return '/dashboard#profile';
}

/**
 * Development-only shortcut from the site into the content dashboard. Rendered behind a
 * `process.env.NODE_ENV === 'development'` check, so production builds drop it entirely.
 */
export const DevEditButton: React.FC = () => {
  const view = usePortfolioStore((s) => s.activeView);
  const playlistId = usePortfolioStore((s) => s.activePlaylistId);
  const recommenderId = usePortfolioStore((s) => s.activeRecommenderId);
  return (
    <a
      href={dashboardLinkFor(view, playlistId, recommenderId)}
      data-testid="dev-edit-button"
      title="Open this page in the content dashboard (only shown under npm run dev)"
      className="fixed bottom-[84px] left-3 z-[110] rounded-full bg-[#ffa42b] px-3 py-1.5 text-xs font-bold text-black shadow-spotify-elevated hover:scale-104"
    >
      Edit content
    </a>
  );
};
