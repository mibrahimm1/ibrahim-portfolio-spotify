import { CSSProperties, RefObject, useEffect } from 'react';
import { useIsomorphicLayoutEffect } from '@/lib/utils';

/**
 * Scroll reveals for every `[data-reveal]` inside `root`.
 *
 * The static HTML never hides anything, so the page reads fine without JavaScript, in print
 * and for crawlers. Right after hydration (before the next paint), only elements that are
 * still *below* the viewport are set to `data-state="pending"` (hidden by landing.css), then
 * shown once as they scroll in. What's already on screen is never hidden and re-shown.
 * Stagger comes from a `--d` delay set by the component (see `revealDelay`).
 */
export function useReveals(root: RefObject<HTMLElement | null>) {
  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const targets = [...el.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
      (t) => t.getBoundingClientRect().top > window.innerHeight * 0.92
    );
    targets.forEach((t) => (t.dataset.state = 'pending'));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const t = entry.target as HTMLElement;
          t.dataset.state = 'shown';
          t.dispatchEvent(new CustomEvent('reveal'));
          observer.unobserve(t);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );
    targets.forEach((t) => observer.observe(t));

    // Printing or jumping to an anchor must never leave content hidden.
    const showAll = () => targets.forEach((t) => (t.dataset.state = 'shown'));
    window.addEventListener('beforeprint', showAll);
    return () => {
      observer.disconnect();
      window.removeEventListener('beforeprint', showAll);
    };
  }, [root]);
}

/** Inline style for a staggered child: `style={revealDelay(i)}`. */
export function revealDelay(index: number, step = 70): CSSProperties {
  return { ['--d' as string]: `${Math.min(index, 8) * step}ms` };
}

/** Runs `onReveal` when the element is revealed, or at once if it was never hidden. */
export function useOnReveal(ref: RefObject<HTMLElement | null>, onReveal: () => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const node = el.closest<HTMLElement>('[data-reveal]') ?? el;
    if (node.dataset.state !== 'pending') return;
    const handler = () => onReveal();
    node.addEventListener('reveal', handler, { once: true });
    return () => node.removeEventListener('reveal', handler);
  }, [ref, onReveal]);
}
