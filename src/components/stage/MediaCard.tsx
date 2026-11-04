import React from 'react';
import { cn } from '@/lib/utils';
import { PlayButton } from '@/components/common/PlayButton';

interface MediaCardProps {
  title: string;
  subtitle: string;
  art: React.ReactNode;
  onOpen?: () => void;
  onPlay?: () => void;
  isPlaying?: boolean;
  circular?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  testId?: string;
}

/**
 * Spotify shelf card: 12px padding, 6px radius, transparent until hover
 * (#1f1f1f-ish wash), artwork with a soft drop shadow, a floating accent play
 * button that slides up on hover, 16px title and 14px two-line subtitle.
 */
export const MediaCard: React.FC<MediaCardProps> = ({
  title,
  subtitle,
  art,
  onOpen,
  onPlay,
  isPlaying = false,
  circular = false,
  onContextMenu,
  testId,
}) => {
  const interactive = !!onOpen;
  return (
    <div
      data-testid={testId}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? title : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault();
          onOpen?.();
        }
      }}
      onContextMenu={onContextMenu}
      className={cn(
        'group relative flex min-w-0 flex-col rounded-md p-3 transition-colors duration-200 ease-spotify',
        interactive && 'cursor-pointer hover:bg-[rgba(255,255,255,0.07)] focus-visible:bg-[rgba(255,255,255,0.07)]'
      )}
    >
      <div className={cn('relative mb-2 aspect-square w-full shadow-spotify-card', circular ? 'rounded-full' : 'rounded-md')}>
        {art}
        {onPlay && (
          <div className="absolute bottom-2 right-2">
            <PlayButton
              size={48}
              floating
              isPlaying={isPlaying}
              label={isPlaying ? `Pause ${title}` : `Play ${title}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
            />
          </div>
        )}
      </div>
      <p className="truncate text-base text-white" title={title}>
        {title}
      </p>
      <p className="mt-0.5 line-clamp-2 text-sm text-subdued">{subtitle}</p>
    </div>
  );
};
