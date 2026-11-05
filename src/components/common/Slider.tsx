import React, { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number; // 0-100
  onChange: (value: number) => void;
  label: string;
  valueText?: string;
  step?: number;
  className?: string;
  testId?: string;
  /** Touch screens can't hover, so the full player shows the knob all the time (as Spotify's app does). */
  alwaysShowKnob?: boolean;
}

/**
 * Spotify progress / volume bar: 4px rounded track (#4d4d4d), white fill that
 * turns accent on hover, and a 12px white knob that appears on hover or drag.
 * Pointer capture makes dragging work even when the cursor leaves the bar.
 */
export const Slider: React.FC<SliderProps> = ({ value, onChange, label, valueText, step = 5, className, testId, alwaysShowKnob = false }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const shown = dragValue ?? value;

  const valueFromEvent = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragValue(valueFromEvent(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragValue === null) return;
    setDragValue(valueFromEvent(e.clientX));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragValue === null) return;
    onChange(valueFromEvent(e.clientX));
    setDragValue(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = value + step;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = value - step;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = 100;
    if (next !== null) {
      e.preventDefault();
      e.stopPropagation();
      onChange(Math.min(100, Math.max(0, next)));
    }
  };

  const dragging = dragValue !== null;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown)}
      aria-valuetext={valueText}
      data-testid={testId}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setDragValue(null)}
      onKeyDown={onKeyDown}
      className={cn('group/slider relative flex h-3 cursor-pointer touch-none items-center', className)}
    >
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#4d4d4d]">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-white group-hover/slider:bg-accent group-focus-visible/slider:bg-accent',
            dragging && 'bg-accent'
          )}
          style={{ width: `${shown}%` }}
        />
      </div>
      <div
        className={cn(
          'pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.5)] opacity-0 group-hover/slider:opacity-100 group-focus-visible/slider:opacity-100',
          (dragging || alwaysShowKnob) && 'opacity-100'
        )}
        style={{ left: `${shown}%` }}
      />
    </div>
  );
};
