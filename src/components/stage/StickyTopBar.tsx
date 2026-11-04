import React from 'react';
import { useStageScroll } from './StageContext';
import { PlayButton } from '@/components/common/PlayButton';

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
    <div className="sticky top-0 z-30 -mb-16 h-16 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))',
          opacity: bgOpacity,
        }}
      />
      <div
        className="relative flex h-full items-center gap-2 px-6 transition-opacity duration-200 ease-spotify"
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
            className={showTitle ? 'pointer-events-auto' : 'pointer-events-none'}
          />
        )}
        <span className="truncate text-2xl font-bold tracking-tight text-white">{title}</span>
      </div>
    </div>
  );
};
