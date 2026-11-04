import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from './Tooltip';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tooltip?: React.ReactNode;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  /** Accent colour + the small indicator dot Spotify puts under toggled player controls. */
  active?: boolean;
  showActiveDot?: boolean;
  /** "subdued" = #b3b3b3 → white on hover (player/action bars). "circle" = #1f1f1f disc (top bar). */
  variant?: 'subdued' | 'circle' | 'ghost';
  size?: number;
  children: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      label,
      tooltip,
      tooltipSide = 'top',
      active = false,
      showActiveDot = false,
      variant = 'subdued',
      size = 32,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses =
      variant === 'circle'
        ? 'rounded-full bg-elevated text-subdued hover:text-white hover:bg-highlight hover:scale-104'
        : variant === 'ghost'
          ? 'rounded-full text-subdued hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
          : active
            ? 'text-accent hover:text-accent-hover hover:scale-104'
            : 'text-subdued hover:text-white hover:scale-104';

    return (
      <Tooltip label={tooltip ?? label} side={tooltipSide}>
        <button
          ref={ref}
          type="button"
          aria-label={label}
          className={cn(
            'relative inline-flex flex-shrink-0 items-center justify-center transition-[color,transform,background-color] duration-150 ease-spotify active:scale-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100',
            variantClasses,
            className
          )}
          style={{ width: size, height: size, ...props.style }}
          {...props}
        >
          {children}
          {active && showActiveDot && (
            <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
          )}
        </button>
      </Tooltip>
    );
  }
);

IconButton.displayName = 'IconButton';
