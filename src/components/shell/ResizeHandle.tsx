import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  /** Which panel edge the handle sits on. */
  edge: 'left' | 'right';
  width: number;
  onResize: (width: number) => void;
  label: string;
  min: number;
  max: number;
}

/**
 * Spotify lets you drag the gap between panels to resize them; the handle shows
 * a 1px highlight line on hover and supports arrow keys for keyboard users.
 */
export const ResizeHandle: React.FC<ResizeHandleProps> = ({ edge, width, onResize, label, min, max }) => {
  const start = useRef<{ x: number; width: number } | null>(null);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(width)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, width };
        document.body.style.cursor = 'col-resize';
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const dx = e.clientX - start.current.x;
        onResize(start.current.width + (edge === 'right' ? dx : -dx));
      }}
      onPointerUp={() => {
        start.current = null;
        document.body.style.cursor = '';
      }}
      onKeyDown={(e) => {
        const grow = edge === 'right' ? 'ArrowRight' : 'ArrowLeft';
        const shrink = edge === 'right' ? 'ArrowLeft' : 'ArrowRight';
        if (e.key === grow) onResize(width + 16);
        if (e.key === shrink) onResize(width - 16);
      }}
      className={cn(
        'group absolute top-0 z-30 flex h-full w-2 cursor-col-resize touch-none justify-center outline-none',
        edge === 'right' ? '-right-1' : '-left-1'
      )}
    >
      <span className="h-full w-px bg-transparent transition-colors group-hover:bg-[#7c7c7c] group-focus-visible:bg-white group-active:bg-white" />
    </div>
  );
};
