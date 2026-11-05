import { RefObject, useEffect, useRef, useState } from 'react';
import { usePointerEffects } from './media';

/**
 * Magnetic hover: the element leans toward the pointer (by `strength` of the offset from
 * its centre) and springs back on leave. An optional inner label moves half as far, which
 * gives the layered feel. No-op on touch or with reduced motion.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);
  const enabled = usePointerEffects();
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const label = el.querySelector<HTMLElement>('[data-magnetic-label]');
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (label) label.style.transform = `translate3d(${x * 0.5}px, ${y * 0.5}px, 0)`;
    };
    const leave = () => {
      el.style.transform = '';
      if (label) label.style.transform = '';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      leave();
    };
  }, [enabled, strength]);
  return ref;
}

/** Gentle 3D tilt toward the pointer (max `degrees`). */
export function useTilt<T extends HTMLElement>(degrees = 5) {
  const ref = useRef<T>(null);
  const enabled = usePointerEffects();
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py * degrees).toFixed(2)}deg) rotateY(${(px * degrees).toFixed(2)}deg)`;
    };
    const leave = () => (el.style.transform = '');
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      leave();
    };
  }, [enabled, degrees]);
  return ref;
}

/**
 * Smoothly follows the pointer inside `area` (linear interpolation per frame, like a
 * spring with no overshoot). Returns refs to position and whether the pointer is inside.
 * Writes transforms straight to the elements, so React doesn't re-render per frame.
 */
export function useFollower(area: RefObject<HTMLElement | null>, layers: { ref: RefObject<HTMLElement | null>; ease: number }[]) {
  const enabled = usePointerEffects();
  const [inside, setInside] = useState(false);
  const layersRef = useRef(layers);
  layersRef.current = layers;

  useEffect(() => {
    const el = area.current;
    if (!el || !enabled) return;
    const target = { x: 0, y: 0 };
    const current = layersRef.current.map(() => ({ x: 0, y: 0 }));
    let frame = 0;
    let started = false;

    const tick = () => {
      let moving = false;
      layersRef.current.forEach((layer, i) => {
        const c = current[i];
        c.x += (target.x - c.x) * layer.ease;
        c.y += (target.y - c.y) * layer.ease;
        if (Math.abs(target.x - c.x) > 0.2 || Math.abs(target.y - c.y) > 0.2) moving = true;
        const node = layer.ref.current;
        if (node) {
          node.style.setProperty('--fx', `${c.x}px`);
          node.style.setProperty('--fy', `${c.y}px`);
        }
      });
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!started) {
        // Start where the pointer entered, rather than flying in from the corner.
        current.forEach((c) => {
          c.x = e.clientX;
          c.y = e.clientY;
        });
        started = true;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const enter = (e: PointerEvent) => {
      started = false;
      move(e);
      setInside(true);
    };
    const leave = () => setInside(false);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [area, enabled]);

  return { enabled, inside: enabled && inside };
}
