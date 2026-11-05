import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile, footer } from '@/data/portfolioData';
import { HomeProfileView } from './HomeProfileView';
import { PlaylistTableView } from './PlaylistTableView';
import { RecommenderProfileView } from './RecommenderProfileView';
import { LyricsModeView } from './LyricsModeView';
import { BrowseView } from './BrowseView';
import { LibraryView } from './LibraryView';
import { ContactView } from './ContactView';
import { StageContext } from './StageContext';

const StageFooter: React.FC = () => (
  <footer className="mt-4 border-t border-[rgba(255,255,255,0.1)] px-8 pb-12 pt-8 text-sm text-subdued">
    <div className="flex flex-wrap gap-x-16 gap-y-6">
      {footer.columns.map((column) => (
        <div key={column.title}>
          <p className="mb-2 font-bold text-white">{column.title}</p>
          <ul className="space-y-2">
            {column.links.map((link) => {
              const external = /^https?:/i.test(link.href);
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    download={link.download ? candidateProfile.resumeFileName : undefined}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="hover:text-white hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
    {/* The non-affiliation notice is fixed in code so forks can't accidentally drop it. */}
    <p className="mt-8 border-t border-[rgba(255,255,255,0.1)] pt-8">
      © {new Date().getFullYear()} {candidateProfile.name}. A Spotify-inspired portfolio; not affiliated with Spotify AB.
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
        className="spotify-scroll relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg bg-surface max-md:rounded-none"
      >
        <div className="flex-1">
          {activeView === 'home' && <HomeProfileView />}
          {(activeView === 'playlist' || activeView === 'recruiter-mix') && <PlaylistTableView />}
          {activeView === 'recommender' && <RecommenderProfileView />}
          {activeView === 'lyrics' && <LyricsModeView />}
          {activeView === 'browse' && <BrowseView />}
          {activeView === 'library' && <LibraryView />}
          {activeView === 'contact' && <ContactView />}
        </div>
        {activeView !== 'lyrics' && <StageFooter />}
        {/* Room for the phone mini-player and tab bar, which float over the page. */}
        <div aria-hidden="true" className="h-[calc(136px+env(safe-area-inset-bottom))] flex-shrink-0 md:hidden" />
      </main>
    </StageContext.Provider>
  );
};
