import React, { useEffect, useId, useRef } from 'react';
import { CloseIcon } from '@/components/common/Icons';
import { cn } from '@/lib/utils';

interface DialogProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  testId?: string;
  className?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Spotify's modal shell (#282828, 8px radius, 24px padding, title + × close)
 * with real dialog semantics: focus moves in on open, Tab is trapped inside,
 * focus returns to the trigger on close. Escape is handled globally.
 */
export const Dialog: React.FC<DialogProps> = ({ title, onClose, children, width = 524, testId, className }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ??
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid={testId}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.7)] animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        onKeyDown={onKeyDown}
        className={cn('relative max-h-[90vh] overflow-y-auto rounded-lg bg-menu p-6 text-white shadow-spotify-elevated animate-scale-up', className)}
        style={{ width }}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-bold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-subdued transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
