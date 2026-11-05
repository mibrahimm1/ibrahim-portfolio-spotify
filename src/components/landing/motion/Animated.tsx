'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './media';
import { useOnReveal } from './reveal';
import { cn } from '@/lib/utils';

/**
 * Cycles through `words` in one slot: the current word slides up and out while the next
 * rises in. All words share one grid cell, so the slot keeps the size of the largest and
 * the layout never jumps. Decorative: pair it with a screen-reader sentence (see Hero).
 * Pauses on hover, while the tab is hidden, and entirely under reduced motion.
 */
export const WordRotator: React.FC<{ words: string[]; interval?: number; className?: string }> = ({ words, interval = 2600, className }) => {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused || words.length < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [reduced, paused, words.length, interval]);

  return (
    <span
      aria-hidden="true"
      data-testid="landing-rotator"
      className={cn('inline-grid overflow-hidden align-bottom', className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {words.map((word, i) => {
        const offset = i === index ? 0 : i === (index - 1 + words.length) % words.length ? -1 : 1;
        return (
          <span
            key={word}
            data-active={i === index || undefined}
            className="col-start-1 row-start-1 transition-[transform,opacity] duration-700 ease-out-soft motion-reduce:transition-none"
            style={{ transform: `translateY(${offset * 105}%)`, opacity: offset === 0 ? 1 : 0 }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

/**
 * A strip that scrolls sideways forever and speeds up (or reverses) with the page scroll.
 * The base loop is a CSS animation; scroll velocity only changes its playbackRate through
 * the Web Animations API, so there's no per-frame layout work.
 */
export const Marquee: React.FC<{ children: React.ReactNode; className?: string; label: string }> = ({ children, className, label }) => {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = track.current;
    if (!el || reduced) return;
    const animation = el.getAnimations?.()[0];
    if (!animation) return;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let rate = 1;
    let target = 1;
    let direction = 1;
    let frame = 0;
    const tick = () => {
      rate += (target - rate) * 0.08;
      target += (direction - target) * 0.05; // ease back to cruising speed
      animation.playbackRate = rate;
      frame = Math.abs(rate - direction) > 0.01 ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const v = dy / Math.max(16, now - lastT); // px per ms
      lastY = window.scrollY;
      lastT = now;
      if (dy !== 0) direction = dy > 0 ? 1 : -1;
      target = direction * Math.min(1 + Math.abs(v) * 2.5, 5);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div className={cn('group relative overflow-hidden landing-fade-edges', className)} role="region" aria-label={label}>
      <div ref={track} className="landing-marquee flex w-max motion-reduce:animate-none group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};

/** Counts the leading number of `value` up from zero when it scrolls into view. */
export const CountUp: React.FC<{ value: string; className?: string }> = ({ value, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const match = value.match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  const [shown, setShown] = useState(value);

  const run = useCallback(() => {
    if (!match || reduced) return;
    const [, pre, num, post] = match;
    const target = Number(num.replace(/,/g, ''));
    const decimals = num.includes('.') ? num.split('.')[1].length : 0;
    const grouped = num.includes(',');
    const start = performance.now();
    const duration = 1100;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const n = (target * eased).toFixed(decimals);
      setShown(`${pre}${grouped ? Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals }) : n}${post}`);
      if (t < 1) requestAnimationFrame(step);
    };
    setShown(`${pre}${(0).toFixed(decimals)}${post}`);
    requestAnimationFrame(step);
  }, [match, reduced]);

  useOnReveal(ref, run);
  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
};

/** The visitor-facing clock for the owner's time zone; renders after hydration only. */
export const LocalTime: React.FC<{ timeZone: string; className?: string }> = ({ timeZone, className }) => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return <span className={className}>&nbsp;</span>;
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return (
    <time className={className} dateTime={now.toISOString()} data-testid="landing-local-time">
      {get('hour')}
      <span className="landing-blink">:</span>
      {get('minute')} {get('timeZoneName')}
    </time>
  );
};

/** 0–1 page scroll progress, written to a CSS variable on `ref` (no re-renders). */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current?.style.setProperty('--progress', String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

/** True once the page has scrolled past `offset` px. */
export function useScrolledPast(offset: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return past;
}
