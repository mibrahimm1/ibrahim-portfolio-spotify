import React from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { allPlaylists, technologyAvatars } from '@/data/portfolioData';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { deepTone } from '@/lib/color';
import { TECH_PLAYLIST_PREFIX } from '@/lib/catalog';

interface Tile {
  id: string;
  title: string;
  color: string;
  playlistId: string;
}

/** Spotify's "Browse all" grid: colour tiles with a bold title and tilted artwork in the corner. */
export const BrowseView: React.FC = () => {
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);

  const sections: { title: string; tiles: Tile[] }[] = [
    {
      title: 'Browse the portfolio',
      tiles: allPlaylists.map((p) => ({ id: p.id, title: p.title, color: p.coverColor, playlistId: p.id })),
    },
    {
      title: 'Browse by stack',
      tiles: technologyAvatars.map((t) => ({
        id: t.id,
        title: t.name,
        color: t.color,
        playlistId: `${TECH_PLAYLIST_PREFIX}${t.id}`,
      })),
    },
  ];

  return (
    <div className="w-full px-6 pb-10 pt-20 select-none" data-testid="browse-view">
      {sections.map((section) => (
        <section key={section.title} className="mb-8">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">{section.title}</h2>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {section.tiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => navigateToPlaylist(tile.playlistId)}
                className="group relative aspect-[1.6/1] overflow-hidden rounded-lg p-4 text-left"
                style={{ backgroundColor: deepTone(tile.color, 0.42, 0.7) }}
              >
                <span className="relative z-10 block max-w-[75%] text-2xl font-bold leading-tight tracking-tight text-white">
                  {tile.title}
                </span>
                <CoverArt
                  color={tile.color}
                  kind={artKindFor(tile.playlistId.startsWith(TECH_PLAYLIST_PREFIX) ? undefined : tile.playlistId)}
                  isRecruiterMix={tile.playlistId === 'recruiter-mix'}
                  size={96}
                  shadow
                  className="absolute -bottom-2 -right-4 rotate-[25deg] transition-transform duration-300 ease-spotify group-hover:rotate-[20deg] group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
