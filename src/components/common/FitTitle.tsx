import React, { useRef, useState } from 'react';
import { cn, useIsomorphicLayoutEffect } from '@/lib/utils';

// Spotify's header title steps down through fixed sizes until it fits on (at most) two lines.
const SIZES = [96, 72, 48, 32];

interface FitTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: string;
  maxSize?: number;
}

export const FitTitle: React.FC<FitTitleProps> = ({ children, maxSize = 96, className, ...props }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const [size, setSize] = useState(() => SIZES.find((s) => s <= maxSize) ?? 32);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const fit = () => {
      const candidates = SIZES.filter((s) => s <= maxSize);
      for (const candidate of candidates) {
        el.style.fontSize = `${candidate}px`;
        const lines = Math.round(el.scrollHeight / (candidate * 1.05));
        const fitsWidth = el.scrollWidth <= el.clientWidth + 1;
        // Large sizes must fit on one line; the smallest two may wrap to two.
        if (fitsWidth && (lines <= 1 || (candidate <= 48 && lines <= 2))) {
          setSize(candidate);
          return;
        }
      }
      setSize(candidates[candidates.length - 1] ?? 32);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [children, maxSize]);

  return (
    <h1
      ref={ref}
      className={cn('font-black leading-[1.05] tracking-[-0.04em] text-white break-words line-clamp-2', className)}
      style={{ fontSize: size }}
      {...props}
    >
      {children}
    </h1>
  );
};
