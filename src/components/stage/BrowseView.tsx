import React from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { allPlaylists, technologyAvatars } from '@/data/portfolioData';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { SearchIcon } from '@/components/common/Icons';
import { deepTone } from '@/lib/color';
import { TECH_PLAYLIST_PREFIX } from '@/lib/catalog';

interface Tile {
  id: string;
  title: string;
  color: string;
  image?: string;
  playlistId: string;
}

/**
 * Spotify's "Browse all" grid: colour tiles with a bold title and tilted artwork in the
 * corner. On phones this is the Search tab: a white search field on top (tapping it opens
 * the full-screen search) and a two-column grid of shorter tiles.
 */
export const BrowseView: React.FC = () => {
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);
  const setSearchOpen = usePortfolioStore((s) => s.setSearchOpen);

  const sections: { title: string; tiles: Tile[] }[] = [
    {
      title: 'Browse the portfolio',
      tiles: allPlaylists.map((p) => ({ id: p.id, title: p.title, color: p.coverColor, image: p.coverImage, playlistId: p.id })),
    },
    {
      title: 'Browse by stack',
      tiles: technologyAvatars.map((t) => ({ id: t.id, title: t.name, color: t.color, image: t.image, playlistId: `${TECH_PLAYLIST_PREFIX}${t.id}` })),
    },
  ];

  return (
    <div className="w-full px-6 pb-10 pt-20 select-none max-md:px-4 max-md:pt-[max(16px,env(safe-area-inset-top))]" data-testid="browse-view">
      <div className="md:hidden">
        <h1 className="pb-4 text-2xl font-bold tracking-tight">Search</h1>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          data-testid="m-search-field"
          className="mb-6 flex h-12 w-full items-center gap-3 rounded-md bg-white px-3 text-left text-base font-bold text-[#121212]"
        >
          <SearchIcon size={22} />
          <span className="font-normal text-[#535353]">What do you want to know?</span>
        </button>
      </div>

      {sections.map((section) => (
        <section key={section.title} className="mb-8 max-md:mb-6">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-white max-md:mb-3 max-md:text-base">{section.title}</h2>
          <div className="grid grid-cols-2 gap-6 max-md:gap-4 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {section.tiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => navigateToPlaylist(tile.playlistId)}
                className="group relative aspect-[1.6/1] overflow-hidden rounded-lg p-4 text-left max-md:aspect-auto max-md:h-[100px] max-md:rounded-md max-md:p-3"
                style={{ backgroundColor: deepTone(tile.color, 0.42, 0.7) }}
              >
                <span className="relative z-10 block max-w-[75%] text-2xl font-bold leading-tight tracking-tight text-white max-md:text-base">
                  {tile.title}
                </span>
                <CoverArt
                  color={tile.color}
                  image={tile.image}
                  kind={artKindFor(tile.playlistId.startsWith(TECH_PLAYLIST_PREFIX) ? undefined : tile.playlistId)}
                  isRecruiterMix={tile.playlistId === 'recruiter-mix'}
                  size={96}
                  shadow
                  className="absolute -bottom-2 -right-4 rotate-[25deg] transition-transform duration-300 ease-spotify group-hover:rotate-[20deg] group-hover:scale-105 max-md:!h-16 max-md:!w-16"
                />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
