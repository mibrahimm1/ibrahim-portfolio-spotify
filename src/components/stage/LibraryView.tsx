import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { allPlaylists, candidateProfile, recommenders, technologyAvatars } from '@/data/portfolioData';
import { RECRUITER_MIX_ID, TECH_PLAYLIST_PREFIX } from '@/lib/catalog';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { CloseIcon, CompactIcon, ListIcon, PinIcon, SearchIcon, VolumeIcon } from '@/components/common/Icons';
import { openMenuAt, playlistMenuHeader, playlistMenuItems } from '@/lib/menus';
import { cn } from '@/lib/utils';

type Chip = 'playlists' | 'stack' | 'endorsements';

interface Row {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  image?: string;
  round?: boolean;
  isMix?: boolean;
  pinned?: boolean;
  open: () => void;
  menuId?: string;
  art: React.ReactNode;
}

/**
 * The Your Library tab on phones: avatar + title, a search toggle, filter chips
 * (Playlists · Stack · Endorsements), and the list/grid toggle. The pinned Recruiter Mix
 * always stays on top, as Liked Songs does in the app.
 */
export const LibraryView: React.FC = () => {
  const { playContextId, isPlaying, mixCount } = usePortfolioStore(
    useShallow((s) => ({ playContextId: s.playContextId, isPlaying: s.isPlaying, mixCount: s.recruiterMix.length }))
  );
  const navigateToPlaylist = usePortfolioStore((s) => s.navigateToPlaylist);
  const navigateToRecommender = usePortfolioStore((s) => s.navigateToRecommender);
  const setDrawerOpen = usePortfolioStore((s) => s.setProfileDrawerOpen);
  const [chip, setChip] = useState<Chip | null>(null);
  const [grid, setGrid] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const playlistRows: Row[] = allPlaylists.map((p) => {
    const isMix = p.id === RECRUITER_MIX_ID;
    return {
      id: p.id,
      title: p.title,
      subtitle: isMix ? `Playlist • ${mixCount} ${mixCount === 1 ? 'item' : 'items'}` : p.subtitle,
      color: p.coverColor,
      image: p.coverImage,
      isMix,
      pinned: isMix,
      open: () => navigateToPlaylist(p.id),
      menuId: p.id,
      art: <CoverArt color={p.coverColor} image={p.coverImage} kind={artKindFor(p.id)} isRecruiterMix={isMix} className="h-full w-full" />,
    };
  });
  const stackRows: Row[] = technologyAvatars.map((t) => ({
    id: `${TECH_PLAYLIST_PREFIX}${t.id}`,
    title: `This Is ${t.name}`,
    subtitle: `Playlist • ${t.category}`,
    color: t.color,
    image: t.image,
    open: () => navigateToPlaylist(`${TECH_PLAYLIST_PREFIX}${t.id}`),
    menuId: `${TECH_PLAYLIST_PREFIX}${t.id}`,
    art: (
      <div className="flex h-full w-full items-center justify-center text-lg font-black tracking-tighter" style={{ backgroundColor: t.color, color: 'rgba(0,0,0,0.75)' }}>
        {t.monogram}
      </div>
    ),
  }));
  const endorsementRows: Row[] = recommenders.map((r) => ({
    id: r.id,
    title: r.name,
    subtitle: `Profile • ${r.ranking}`,
    color: '#333333',
    round: true,
    open: () => navigateToRecommender(r.id),
    art: r.photo ? (
      // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
      <img src={r.photo} alt="" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-[#333] text-base font-bold">{r.avatarInitials}</div>
    ),
  }));

  const rows = (chip === 'playlists' ? playlistRows : chip === 'stack' ? stackRows : chip === 'endorsements' ? endorsementRows : [...playlistRows, ...endorsementRows])
    .filter((r) => !query.trim() || r.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="min-h-full pb-6" data-testid="library-view">
      <div className="sticky top-0 z-20 bg-surface px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] shadow-[0_6px_10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open profile menu"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#535353] text-sm font-bold md:hidden"
          >
            {candidateProfile.avatarLetter}
          </button>
          {searching ? (
            <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded bg-highlight px-2">
              <SearchIcon size={16} className="text-subdued" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in Your Library"
                aria-label="Search in Your Library"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subdued"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setSearching(false);
                  setQuery('');
                }}
              >
                <CloseIcon size={14} />
              </button>
            </div>
          ) : (
            <>
              <h1 className="flex-1 text-2xl font-bold tracking-tight">Your Library</h1>
              <button type="button" aria-label="Search in Your Library" onClick={() => setSearching(true)} className="flex h-10 w-10 items-center justify-center">
                <SearchIcon size={22} />
              </button>
            </>
          )}
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Filter Your Library">
          {chip && (
            <button type="button" aria-label="Clear filter" onClick={() => setChip(null)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.1)]">
              <CloseIcon size={12} />
            </button>
          )}
          {(['playlists', 'stack', 'endorsements'] as Chip[])
            .filter((c) => !chip || c === chip)
            .map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={chip === c}
                onClick={() => setChip(chip === c ? null : c)}
                className={cn('h-8 flex-shrink-0 rounded-full px-3 text-sm capitalize', chip === c ? 'bg-accent text-black' : 'bg-[rgba(255,255,255,0.1)]')}
              >
                {c === 'stack' ? 'Stack' : c === 'endorsements' ? 'Endorsements' : 'Playlists'}
              </button>
            ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-subdued">Custom order</span>
        <button type="button" aria-label={grid ? 'Show as list' : 'Show as grid'} onClick={() => setGrid((g) => !g)} className="flex h-8 w-8 items-center justify-center text-subdued">
          {grid ? <ListIcon size={16} /> : <CompactIcon size={16} />}
        </button>
      </div>

      {rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-subdued">Couldn&apos;t find “{query}”</p>}

      <ul className={grid ? 'grid grid-cols-3 gap-x-3 gap-y-5 px-4' : 'px-4'}>
        {rows.map((row) => {
          const playing = isPlaying && playContextId === row.id;
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={row.open}
                onContextMenu={(e) => row.menuId && openMenuAt(e, playlistMenuItems(row.menuId), playlistMenuHeader(row.menuId))}
                data-testid={`library-row-${row.id}`}
                className={cn('w-full text-left active:opacity-70', grid ? 'block' : 'flex h-[72px] items-center gap-3')}
              >
                <span className={cn('block flex-shrink-0 overflow-hidden', row.round ? 'rounded-full' : 'rounded', grid ? 'aspect-square w-full' : 'h-16 w-16')}>{row.art}</span>
                <span className={cn('block min-w-0', grid ? 'mt-2' : 'flex-1')}>
                  <span className={cn('block truncate text-base', playing ? 'text-accent' : 'text-white')}>{row.title}</span>
                  <span className="flex items-center gap-1 truncate text-sm text-subdued">
                    {row.pinned && <PinIcon size={12} className="flex-shrink-0 text-accent" aria-label="Pinned" />}
                    <span className="truncate">{row.subtitle}</span>
                  </span>
                </span>
                {playing && !grid && <VolumeIcon level={100} size={16} className="flex-shrink-0 text-accent" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
