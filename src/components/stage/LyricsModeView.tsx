import React, { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile, coverLetterStanzas } from '@/data/portfolioData';
import { stanzaStartFractions } from '@/lib/catalog';
import { deepTone } from '@/lib/color';
import { cn } from '@/lib/utils';
import { MobileBackButton } from './StickyTopBar';

/**
 * Spotify's synced-lyrics canvas: a saturated tone of the current artwork,
 * already-sung lines in translucent white, the active line in white and
 * upcoming lines in black. Clicking a line seeks to it.
 */
export const LyricsModeView: React.FC = () => {
  const { progress, coverColor } = usePortfolioStore(
    useShallow((s) => ({ progress: s.progress, coverColor: s.currentTrack.coverColor }))
  );
  const setProgress = usePortfolioStore((s) => s.setProgress);
  const setPlaying = usePortfolioStore((s) => s.setPlaying);

  const fraction = progress / 100;
  let activeStanzaIndex = 0;
  stanzaStartFractions.forEach((start, idx) => {
    if (fraction >= start) activeStanzaIndex = idx;
  });

  const stanzaRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    stanzaRefs.current[activeStanzaIndex]?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [activeStanzaIndex]);

  const handleStanzaClick = (index: number) => {
    // Nudge just past the boundary so rounding never lands on the previous stanza.
    setProgress(stanzaStartFractions[index] * 100 + 0.01);
    setPlaying(true);
  };

  return (
    <div
      data-testid="lyrics-mode-stage"
      className="min-h-full w-full px-6 pb-24 pt-16 select-none animate-fade-in md:px-16 max-md:pt-20"
      style={{ backgroundColor: deepTone(coverColor, 0.4) }}
    >
      <MobileBackButton className="fixed left-4 top-[max(12px,env(safe-area-inset-top))] z-20" />
      <div className="mx-auto max-w-[880px]">
        <p className="mb-10 text-sm font-bold text-[rgba(255,255,255,0.7)]">
          Cover letter · {candidateProfile.name}
        </p>
        <div className="space-y-8">
          {coverLetterStanzas.map((stanza, idx) => {
            const isActive = idx === activeStanzaIndex;
            const isPast = idx < activeStanzaIndex;
            return (
              <p
                key={idx}
                ref={(el) => {
                  stanzaRefs.current[idx] = el;
                }}
                role="button"
                tabIndex={0}
                onClick={() => handleStanzaClick(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStanzaClick(idx);
                }}
                data-testid={isActive ? 'lyrics-active-stanza' : undefined}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'cursor-pointer text-[clamp(1.5rem,2.3vw,2rem)] font-bold leading-[1.45] tracking-[-0.01em] transition-colors duration-300 hover:underline',
                  isActive ? 'text-white' : isPast ? 'text-[rgba(255,255,255,0.7)] hover:text-white' : 'text-black hover:text-white'
                )}
              >
                {stanza}
              </p>
            );
          })}
        </div>
        <p className="mt-16 text-sm text-[rgba(255,255,255,0.7)]">Lyrics written by {candidateProfile.name}</p>
      </div>
    </div>
  );
};
