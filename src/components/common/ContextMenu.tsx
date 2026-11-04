import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { CheckIcon, ExternalLinkIcon } from './Icons';
import { cn, useIsomorphicLayoutEffect } from '@/lib/utils';

/**
 * Global right-click / "..." menu, styled after Spotify's: #282828 surface,
 * 4px padding, 14px items with a rgba(255,255,255,.1) hover, closes on outside
 * click, scroll, resize or Escape. Arrow keys move focus between items.
 */
export const ContextMenu: React.FC = () => {
  const menu = usePortfolioStore((s) => s.contextMenu);
  const close = usePortfolioStore((s) => s.closeContextMenu);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!menu || !ref.current) {
      setPos(null);
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const left = Math.min(menu.x, window.innerWidth - rect.width - 8);
    const top = menu.y + rect.height > window.innerHeight - 8 ? Math.max(8, menu.y - rect.height) : menu.y;
    setPos({ top, left: Math.max(8, left) });
    ref.current.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onDismiss = () => close();
    window.addEventListener('mousedown', onPointer);
    window.addEventListener('resize', onDismiss);
    window.addEventListener('wheel', onDismiss, { passive: true });
    window.addEventListener('blur', onDismiss);
    return () => {
      window.removeEventListener('mousedown', onPointer);
      window.removeEventListener('resize', onDismiss);
      window.removeEventListener('wheel', onDismiss);
      window.removeEventListener('blur', onDismiss);
    };
  }, [menu, close]);

  if (!menu || typeof document === 'undefined') return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === 'ArrowDown' ? (idx + 1) % buttons.length : (idx - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  return createPortal(
    <div
      ref={ref}
      role="menu"
      data-testid="context-menu"
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      style={{ top: pos?.top ?? menu.y, left: pos?.left ?? menu.x, visibility: pos ? 'visible' : 'hidden' }}
      className="fixed z-[150] min-w-[196px] max-w-[350px] rounded bg-menu p-1 text-sm text-[rgba(255,255,255,0.9)] shadow-spotify-elevated animate-fade-in"
    >
      {menu.items.map((item) => (
        <React.Fragment key={item.id}>
          {item.dividerBefore && <hr className="mx-1 my-1 border-0 border-t border-[rgba(255,255,255,0.1)]" />}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              item.onSelect();
            }}
            className={cn(
              'flex h-10 w-full items-center gap-3 rounded-sm py-3 pl-3 pr-2 text-left hover:bg-[rgba(255,255,255,0.1)] focus-visible:bg-[rgba(255,255,255,0.1)] focus-visible:outline-none',
              item.checked && 'text-accent'
            )}
          >
            <span className="flex-1 truncate">{item.label}</span>
            {item.checked && <CheckIcon size={16} />}
            {item.external && <ExternalLinkIcon size={16} className="text-subdued" />}
          </button>
        </React.Fragment>
      ))}
    </div>,
    document.body
  );
};
