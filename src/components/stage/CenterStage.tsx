import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile } from '@/data/portfolioData';
import { HomeProfileView } from './HomeProfileView';
import { PlaylistTableView } from './PlaylistTableView';
import { RecommenderProfileView } from './RecommenderProfileView';
import { LyricsModeView } from './LyricsModeView';
import { BrowseView } from './BrowseView';
import { StageContext } from './StageContext';

const StageFooter: React.FC = () => (
  <footer className="mt-4 border-t border-[rgba(255,255,255,0.1)] px-8 pb-12 pt-8 text-sm text-subdued">
    <div className="flex flex-wrap gap-x-16 gap-y-6">
      <div>
        <p className="mb-2 font-bold text-white">Contact</p>
        <ul className="space-y-2">
          <li>
            <a href={`mailto:${candidateProfile.email}`} className="hover:text-white hover:underline">
              Email
            </a>
          </li>
          <li>
            <a href={`tel:${candidateProfile.phone.replace(/\s/g, '')}`} className="hover:text-white hover:underline">
              Phone
            </a>
          </li>
        </ul>
      </div>
      <div>
        <p className="mb-2 font-bold text-white">Profiles</p>
        <ul className="space-y-2">
          <li>
            <a href={candidateProfile.github} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
              GitHub
            </a>
          </li>
          <li>
            <a href={candidateProfile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
      <div>
        <p className="mb-2 font-bold text-white">Useful links</p>
        <ul className="space-y-2">
          <li>
            <a href="/resume" className="hover:text-white hover:underline">
              Standard resume
            </a>
          </li>
          <li>
            <a href="/resume.pdf" download="Muhammad_Ibrahim_Shaikh_Resume.pdf" className="hover:text-white hover:underline">
              Resume (PDF)
            </a>
          </li>
        </ul>
      </div>
    </div>
    <p className="mt-8 border-t border-[rgba(255,255,255,0.1)] pt-8">
      © 2026 {candidateProfile.name}. A Spotify-inspired portfolio; not affiliated with Spotify AB.
    </p>
  </footer>
);

export const CenterStage: React.FC = () => {
  const activeView = usePortfolioStore((s) => s.activeView);
  const activePlaylistId = usePortfolioStore((s) => s.activePlaylistId);
  const activeRecommenderId = usePortfolioStore((s) => s.activeRecommenderId);
  const containerRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(1200);

  // Spotify jumps (not smooth-scrolls) to the top when you open a new page.
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [activeView, activePlaylistId, activeRecommenderId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const context = useMemo(() => ({ scrollRef: containerRef, width }), [width]);

  return (
    <StageContext.Provider value={context}>
      <main
        ref={containerRef}
        data-testid="center-stage"
        className="spotify-scroll relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden rounded-lg bg-surface"
      >
        <div className="flex-1">
          {activeView === 'home' && <HomeProfileView />}
          {(activeView === 'playlist' || activeView === 'recruiter-mix') && <PlaylistTableView />}
          {activeView === 'recommender' && <RecommenderProfileView />}
          {activeView === 'lyrics' && <LyricsModeView />}
          {activeView === 'browse' && <BrowseView />}
        </div>
        {activeView !== 'lyrics' && <StageFooter />}
      </main>
    </StageContext.Provider>
  );
};
