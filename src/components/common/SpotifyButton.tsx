import React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'pill' | 'circle' | 'white';
type Size = 'sm' | 'md' | 'lg';

interface SpotifyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  active?: boolean;
  size?: Size;
  children: React.ReactNode;
}

/** Class list for an Encore button; also applied to <a> elements so links never wrap a <button>. */
export function spotifyButtonClasses(variant: Variant = 'primary', size: Size = 'md', active = false) {
  const baseClasses =
    'inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap font-bold transition-[transform,background-color,border-color] duration-150 ease-spotify cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';

  let variantClasses = '';
  if (variant === 'primary') {
    variantClasses =
      'bg-accent hover:bg-accent-hover active:bg-accent-pressed text-black rounded-full hover:scale-104 active:scale-100';
  } else if (variant === 'white') {
    variantClasses = 'bg-white hover:bg-[#f0f0f0] text-black rounded-full hover:scale-104 active:scale-100';
  } else if (variant === 'secondary') {
    variantClasses =
      'bg-transparent border border-[#7c7c7c] hover:border-white text-white rounded-full hover:scale-104 active:scale-100';
  } else if (variant === 'pill') {
    variantClasses = active
      ? 'bg-white text-black rounded-full hover:bg-[#f0f0f0]'
      : 'bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.1)] text-white rounded-full font-normal';
  } else if (variant === 'circle') {
    variantClasses = 'rounded-full bg-white text-black hover:scale-104 active:scale-100';
  }

  let sizeClasses = '';
  if (variant === 'circle') {
    sizeClasses = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  } else if (variant === 'pill') {
    sizeClasses = 'h-8 px-3 text-sm';
  } else {
    sizeClasses = size === 'sm' ? 'h-8 px-4 text-sm' : size === 'lg' ? 'h-12 px-8 text-base' : 'h-8 px-[15px] text-sm';
  }

  return cn(baseClasses, variantClasses, sizeClasses);
}

/**
 * Encore buttons: bold 14px labels that never wrap, a 1.04 hover scale and
 * no scale on press. Secondary = Spotify's outlined "Follow" pill.
 */
export const SpotifyButton: React.FC<SpotifyButtonProps> = ({
  variant = 'primary',
  active = false,
  size = 'md',
  className = '',
  children,
  ...props
}) => (
  <button type="button" className={cn(spotifyButtonClasses(variant, size, active), className)} {...props}>
    {children}
  </button>
);
