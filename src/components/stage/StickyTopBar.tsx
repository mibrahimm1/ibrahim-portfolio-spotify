import React from 'react';
import { useStageScroll } from './StageContext';
import { PlayButton } from '@/components/common/PlayButton';
import { ChevronLeftIcon } from '@/components/common/Icons';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

/** Phones have no top bar, so every page gets Spotify's round back chevron instead. */
export const MobileBackButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canGoBack = usePortfolioStore((s) => s.historyIndex > 0);
  const navigateBack = usePortfolioStore((s) => s.navigateBack);
  const navigateHome = usePortfolioStore((s) => s.navigateHome);
  return (
    <button
      type="button"
      aria-label="Go back"
      data-testid="m-back"
      onClick={() => (canGoBack ? navigateBack() : navigateHome())}
      className={`pointer-events-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(0,0,0,0.5)] text-white md:hidden ${className}`}
    >
      <ChevronLeftIcon size={16} />
    </button>
  );
};

interface StickyTopBarProps {
  color: string;
  title: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  playLabel?: string;
}

/**
 * Spotify's in-view top bar: transparent over the header, it fills with the
 * header colour as you scroll and fades in a play button + title once the big
 * title has scrolled away.
 */
export const StickyTopBar: React.FC<StickyTopBarProps> = ({ color, title, isPlaying = false, onPlay, playLabel }) => {
  const scrollTop = useStageScroll();
  const bgOpacity = Math.min(1, Math.max(0, (scrollTop - 64) / 200));
  const showTitle = scrollTop > 280;

  return (
    <div className="sticky top-0 z-30 -mb-16 h-16 pointer-events-none max-md:mt-[env(safe-area-inset-top)]">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))',
          opacity: bgOpacity,
        }}
      />
      <MobileBackButton className="absolute left-4 top-1/2 z-10 -translate-y-1/2" />
      <div
        className="relative flex h-full items-center gap-2 px-6 transition-opacity duration-200 ease-spotify max-md:justify-center max-md:px-14"
        style={{ opacity: showTitle ? 1 : 0 }}
      >
        {onPlay && (
          <PlayButton
            size={48}
            isPlaying={isPlaying}
            label={playLabel ?? (isPlaying ? 'Pause' : `Play ${title}`)}
            onClick={onPlay}
            tabIndex={showTitle ? 0 : -1}
            aria-hidden={!showTitle}
            className={`${showTitle ? 'pointer-events-auto' : 'pointer-events-none'} max-md:hidden`}
          />
        )}
        <span className="truncate text-2xl font-bold tracking-tight text-white max-md:text-base">{title}</span>
      </div>
    </div>
  );
};
