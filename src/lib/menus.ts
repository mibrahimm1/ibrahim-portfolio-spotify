import type { MouseEvent } from 'react';
import { ContextMenuItem, Track } from '@/types/portfolio';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { findParentPlaylistId, resolvePlaylist, RECRUITER_MIX_ID } from '@/lib/catalog';
import { candidateProfile } from '@/data/portfolioData';
import { entryToHash } from '@/lib/routing';

function siteUrl(hash: string) {
  if (typeof window === 'undefined') return hash;
  return `${window.location.origin}${window.location.pathname}${hash}`;
}

export async function copyToClipboard(text: string, successMessage: string) {
  const { showToast } = usePortfolioStore.getState();
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast("Couldn't copy to clipboard");
  }
}

export function downloadResume() {
  const link = document.createElement('a');
  link.href = candidateProfile.resumePdf;
  link.download = candidateProfile.resumeFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Items for a track's right-click / "..." menu, mirroring Spotify's track menu. */
export function trackMenuItems(track: Track, contextId?: string): ContextMenuItem[] {
  const s = usePortfolioStore.getState();
  const saved = s.recruiterMix.includes(track.id);
  const parentId = findParentPlaylistId(track.id);
  const items: ContextMenuItem[] = [
    {
      id: 'play',
      label: 'Play',
      onSelect: () => usePortfolioStore.getState().setCurrentTrack(track, true, contextId),
    },
    {
      id: 'mix',
      label: saved ? 'Remove from Your Recruiter Mix' : 'Save to Your Recruiter Mix',
      onSelect: () => usePortfolioStore.getState().toggleBookmark(track.id),
    },
    {
      id: 'details',
      label: 'View details',
      onSelect: () => usePortfolioStore.getState().openTrackDetails(track),
    },
  ];
  if (contextId !== parentId) {
    items.push({
      id: 'goto',
      label: `Go to ${resolvePlaylist(parentId, s.recruiterMix).title}`,
      onSelect: () => usePortfolioStore.getState().navigateToPlaylist(parentId),
    });
  }
  if (track.recommenderId) {
    items.push({
      id: 'endorsement',
      label: 'Read faculty endorsement',
      onSelect: () => usePortfolioStore.getState().navigateToRecommender(track.recommenderId!),
    });
  }
  if (track.externalUrl) {
    items.push({
      id: 'source',
      label: track.externalUrl.includes('doi.org') ? 'Open DOI' : 'Open on GitHub',
      external: true,
      dividerBefore: true,
      onSelect: () => window.open(track.externalUrl, '_blank', 'noopener,noreferrer'),
    });
  }
  if (track.demoUrl) {
    items.push({
      id: 'demo',
      label: 'Open live demo',
      external: true,
      dividerBefore: !track.externalUrl,
      onSelect: () => window.open(track.demoUrl, '_blank', 'noopener,noreferrer'),
    });
  }
  items.push({
    id: 'share',
    label: 'Copy link to playlist',
    dividerBefore: !track.externalUrl && !track.demoUrl,
    onSelect: () =>
      copyToClipboard(
        siteUrl(entryToHash({ view: 'playlist', playlistId: parentId })),
        'Link copied to clipboard'
      ),
  });
  return items;
}

/** Items for a playlist's right-click / "..." menu. */
export function playlistMenuItems(playlistId: string): ContextMenuItem[] {
  const s = usePortfolioStore.getState();
  const playlist = resolvePlaylist(playlistId, s.recruiterMix);
  const isMix = playlistId === RECRUITER_MIX_ID;
  const items: ContextMenuItem[] = [];
  if (playlist.tracks.length > 0) {
    items.push({
      id: 'play',
      label: 'Play',
      onSelect: () => usePortfolioStore.getState().playTrackInContext(playlist.tracks[0], playlistId),
    });
  }
  items.push({
    id: 'open',
    label: 'Open',
    onSelect: () => usePortfolioStore.getState().navigateToPlaylist(playlistId),
  });
  if (isMix) {
    items.push({
      id: 'send',
      label: 'Send mix & book a call',
      onSelect: () => usePortfolioStore.getState().setBookingModalOpen(true),
    });
  }
  items.push(
    {
      id: 'download',
      label: 'Download resume (PDF)',
      dividerBefore: true,
      onSelect: downloadResume,
    },
    {
      id: 'share',
      label: 'Copy link to playlist',
      onSelect: () =>
        copyToClipboard(
          siteUrl(entryToHash(isMix ? { view: 'recruiter-mix' } : { view: 'playlist', playlistId })),
          'Link copied to clipboard'
        ),
    }
  );
  return items;
}

/** Opens a menu at the pointer for right-clicks, or under the button for "..." clicks. */
export function openMenuAt(e: MouseEvent, items: ContextMenuItem[]) {
  e.preventDefault();
  e.stopPropagation();
  const target = e.currentTarget as HTMLElement;
  const fromButton = e.type === 'click';
  const rect = target.getBoundingClientRect();
  usePortfolioStore.getState().openContextMenu({
    x: fromButton ? rect.left : e.clientX,
    y: fromButton ? rect.bottom + 4 : e.clientY,
    items,
  });
}
