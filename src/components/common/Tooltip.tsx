import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn, useIsomorphicLayoutEffect } from '@/lib/utils';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  label: React.ReactNode;
  side?: Side;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const GAP = 8;
const SHOW_DELAY_MS = 400;

/**
 * Spotify-style tooltip: #282828 bubble, 14px text, 4px radius, elevated shadow.
 * Rendered in a portal so overflow-hidden panels never clip it, and shown on
 * keyboard focus as well as hover (native `title` tooltips do neither).
 */
export const Tooltip: React.FC<TooltipProps> = ({ label, side = 'top', children, className, disabled }) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = useCallback(() => {
    if (disabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
  }, [disabled]);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
    setPos(null);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!open || !anchorRef.current || !bubbleRef.current) return;
    const a = anchorRef.current.getBoundingClientRect();
    const b = bubbleRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    if (side === 'top') {
      top = a.top - b.height - GAP;
      left = a.left + a.width / 2 - b.width / 2;
    } else if (side === 'bottom') {
      top = a.bottom + GAP;
      left = a.left + a.width / 2 - b.width / 2;
    } else if (side === 'left') {
      top = a.top + a.height / 2 - b.height / 2;
      left = a.left - b.width - GAP;
    } else {
      top = a.top + a.height / 2 - b.height / 2;
      left = a.right + GAP;
    }
    const maxLeft = window.innerWidth - b.width - 8;
    setPos({ top: Math.max(8, top), left: Math.min(Math.max(8, left), maxLeft) });
  }, [open, side, label]);

  return (
    <span
      ref={anchorRef}
      className={cn('inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onMouseDown={hide}
    >
      {children}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={bubbleRef}
            role="tooltip"
            style={{
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? 'visible' : 'hidden',
            }}
            className="fixed z-[200] max-w-[260px] pointer-events-none rounded bg-menu px-2 py-1 text-sm text-white shadow-spotify-elevated animate-fade-in"
          >
            {label}
          </div>,
          document.body
        )}
    </span>
  );
};
