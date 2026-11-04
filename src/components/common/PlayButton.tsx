import React from 'react';
import { cn } from '@/lib/utils';
import { PauseIcon, PlayIcon } from './Icons';

interface PlayButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  isPlaying: boolean;
  label: string;
  size?: 48 | 56;
  /** Card variant: hidden until the card is hovered, then slides up 8px (Spotify shelf cards). */
  floating?: boolean;
}

/** The big accent play/pause disc used in action bars, cards and sticky headers. */
export const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  label,
  size = 56,
  floating = false,
  className,
  ...props
}) => {
  const icon = size === 56 ? 24 : 20;
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full bg-accent text-black transition-[transform,background-color,opacity] duration-200 ease-spotify hover:scale-104 hover:bg-accent-hover active:scale-100 active:bg-accent-pressed disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
        floating &&
          'shadow-spotify-play opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0',
        floating && isPlaying && 'opacity-100 translate-y-0',
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {isPlaying ? <PauseIcon size={icon} /> : <PlayIcon size={icon} />}
    </button>
  );
};
