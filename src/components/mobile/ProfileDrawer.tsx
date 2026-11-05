import React, { useRef, useState } from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile, whatsNew } from '@/data/portfolioData';
import { findTrack } from '@/lib/catalog';
import { downloadResume } from '@/lib/menus';
import { BellIcon, DownloadIcon, ExternalLinkIcon, SettingsIcon, ArtGlyph } from '@/components/common/Icons';
import { Track } from '@/types/portfolio';

/**
 * Spotify's slide-in profile menu (tap the avatar on Home): who you are, What's New,
 * settings, and the recruiter escape hatch to the plain resume. Swipe left to close.
 */
export const ProfileDrawer: React.FC = () => {
  const open = usePortfolioStore((s) => s.isProfileDrawerOpen);
  const setOpen = usePortfolioStore((s) => s.setProfileDrawerOpen);
  const navigateHome = usePortfolioStore((s) => s.navigateHome);
  const setThemeModalOpen = usePortfolioStore((s) => s.setThemeModalOpen);
  const openTrackDetails = usePortfolioStore((s) => s.openTrackDetails);
  const setFullPlayerOpen = usePortfolioStore((s) => s.setFullPlayerOpen);
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);

  if (!open) return null;

  const close = () => setOpen(false);
  const news = whatsNew.map((id) => findTrack(id)).filter((t): t is Track => Boolean(t));
  const row = 'flex h-14 w-full items-center gap-4 px-4 text-left text-base active:bg-[rgba(255,255,255,0.1)]';

  return (
    <div className="fixed inset-0 z-[150] md:hidden" data-testid="m-profile-drawer">
      <button type="button" aria-label="Close menu" tabIndex={-1} onClick={close} className="absolute inset-0 h-full w-full bg-[rgba(0,0,0,0.6)] animate-fade-in" />
      <nav
        aria-label="Profile menu"
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerMove={(e) => start.current !== null && setDx(Math.min(0, e.clientX - start.current))}
        onPointerUp={() => {
          if (dx < -60) close();
          start.current = null;
          setDx(0);
        }}
        className="absolute inset-y-0 left-0 flex w-[85%] max-w-[360px] touch-pan-y flex-col overflow-y-auto bg-surface pb-safe pt-[max(16px,env(safe-area-inset-top))] animate-drawer-in"
        style={{ transform: dx ? `translateX(${dx}px)` : undefined }}
      >
        <button
          type="button"
          onClick={() => {
            close();
            navigateHome();
          }}
          className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.1)] px-4 pb-5 pt-2 text-left"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#535353] text-lg font-bold">
            {candidateProfile.avatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
              <img src={candidateProfile.avatarImage} alt="" className="h-full w-full object-cover" />
            ) : (
              candidateProfile.avatarLetter
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold">{candidateProfile.name}</span>
            <span className="block text-sm text-subdued">View profile</span>
          </span>
        </button>

        <div className="py-2">
          <p className="flex items-center gap-4 px-4 pb-1 pt-3 text-sm font-bold text-subdued">
            <BellIcon size={18} /> What&apos;s New
          </p>
          {news.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                close();
                openTrackDetails(track);
                setFullPlayerOpen(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-left active:bg-[rgba(255,255,255,0.1)]"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm">{track.title}</span>
                <span className="block truncate text-xs text-subdued">
                  {track.subtitle} · {track.dateAdded}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="border-t border-[rgba(255,255,255,0.1)] py-2">
          <button
            type="button"
            onClick={() => {
              close();
              setThemeModalOpen(true);
            }}
            className={row}
          >
            <SettingsIcon size={22} /> Accent colour
          </button>
          <a href="/resume" className={row} data-testid="m-standard-resume">
            <ArtGlyph kind="document" size={22} /> Standard resume view
          </a>
          <button
            type="button"
            onClick={() => {
              close();
              downloadResume();
            }}
            className={row}
          >
            <DownloadIcon size={22} /> Download resume (PDF)
          </button>
          <a href={candidateProfile.github} target="_blank" rel="noopener noreferrer" className={row}>
            <ExternalLinkIcon size={20} /> GitHub
          </a>
          <a href={candidateProfile.linkedin} target="_blank" rel="noopener noreferrer" className={row}>
            <ExternalLinkIcon size={20} /> LinkedIn
          </a>
        </div>
      </nav>
    </div>
  );
};
