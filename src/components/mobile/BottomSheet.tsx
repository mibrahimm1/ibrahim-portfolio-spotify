import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  onClose: () => void;
  /** Sticky header under the drag handle (e.g. artwork + title for an item menu). */
  header?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  testId?: string;
  role?: string;
  /** Full-height sheet (dialogs, queue) instead of fitting its content. */
  tall?: boolean;
}

const DISMISS_DISTANCE = 100;

/**
 * Spotify's phone bottom sheet: #282828, 12px top radius, a drag handle, slides up,
 * and closes on swipe down, a tap on the dimmed backdrop, or Back (via the overlay history).
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({ onClose, header, label, children, testId, role = 'dialog', tall = false }) => {
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock page scroll behind the sheet.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (start.current === null) return;
    setDrag(Math.max(0, e.clientY - start.current));
  };
  const onPointerUp = () => {
    if (start.current === null) return;
    start.current = null;
    if (drag > DISMISS_DISTANCE) onClose();
    else setDrag(0);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[160] md:hidden" data-testid={testId ? `${testId}-layer` : undefined}>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 h-full w-full bg-[rgba(0,0,0,0.6)] animate-fade-in" />
      <div
        ref={panelRef}
        role={role}
        aria-label={label}
        aria-modal="true"
        tabIndex={-1}
        data-testid={testId}
        className={cn(
          'absolute inset-x-0 bottom-0 flex flex-col rounded-t-xl bg-menu pb-safe text-white shadow-spotify-elevated outline-none animate-sheet-in',
          tall ? 'h-[92dvh]' : 'max-h-[85dvh]'
        )}
        style={{ transform: drag ? `translateY(${drag}px)` : undefined, transition: drag ? 'none' : 'transform 200ms' }}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="flex-shrink-0 touch-none cursor-grab"
        >
          <div className="mx-auto mb-2 mt-2 h-1 w-9 rounded-full bg-[#7c7c7c]" aria-hidden="true" />
          {header}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>,
    document.body
  );
};
