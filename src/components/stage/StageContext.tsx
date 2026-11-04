import React, { createContext, useContext, useEffect, useState } from 'react';

interface StageContextValue {
  scrollRef: React.RefObject<HTMLElement>;
  /** Width of the centre panel; Spotify drops track-table columns as it narrows. */
  width: number;
}

export const StageContext = createContext<StageContextValue>({
  scrollRef: { current: null },
  width: 1200,
});

export const useStage = () => useContext(StageContext);

/** Scroll offset of the centre stage, read only by components that need it (avoids re-rendering whole views). */
export function useStageScroll(): number {
  const { scrollRef } = useStage();
  const [scrollTop, setScrollTop] = useState(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrollTop(el.scrollTop));
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
    };
  }, [scrollRef]);
  return scrollTop;
}

/** Spotify shrinks header artwork when the centre panel gets narrow. */
export function useHeaderArtSize(): number {
  const { width } = useStage();
  return width < 560 ? 128 : width < 760 ? 176 : 232;
}
