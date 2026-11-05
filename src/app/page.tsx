'use client';

import React, { useEffect, useState } from 'react';
import { TopNavBar } from '@/components/shell/TopNavBar';
import { LeftSidebar } from '@/components/shell/LeftSidebar';
import { CenterStage } from '@/components/stage/CenterStage';
import { RightSidebar } from '@/components/shell/RightSidebar';
import { BottomPlayerBar } from '@/components/shell/BottomPlayerBar';
import { AISearchDropdown } from '@/components/modals/AISearchDropdown';
import { SendMixModal } from '@/components/modals/SendMixModal';
import { ThemeSwitcherModal } from '@/components/modals/ThemeSwitcherModal';
import { KeyboardShortcutsModal } from '@/components/modals/KeyboardShortcutsModal';
import { ContextMenu } from '@/components/common/ContextMenu';
import { Toast } from '@/components/common/Toast';
import { DevEditButton } from '@/components/common/DevEditButton';
import { MobileChrome } from '@/components/mobile/MobileChrome';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { useKeyboardShortcuts, usePlaybackTimer, useUrlSync } from '@/lib/hooks';

// Below NARROW_WINDOW with the Now Playing view open, the library folds into its icon rail
// so the centre stage keeps a usable width (as the desktop client does). Tablets (below
// TABLET_MAX) always use the rail, and the Now Playing view floats over the page instead.
const NARROW_WINDOW = 1240;
const TABLET_MAX = 1024;

function useWindowWidth() {
  const [width, setWidth] = useState(1440);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return width;
}

export default function Home() {
  const hydrateFromStorage = usePortfolioStore((state) => state.hydrateFromStorage);
  const isRightSidebarOpen = usePortfolioStore((state) => state.isRightSidebarOpen);
  const windowWidth = useWindowWidth();
  const railLibrary = windowWidth < TABLET_MAX || (windowWidth < NARROW_WINDOW && isRightSidebarOpen);

  useEffect(() => {
    hydrateFromStorage();
    // On tablets the Now Playing view floats over the page, so start with it closed
    // (set directly so the saved desktop preference isn't overwritten).
    if (window.innerWidth >= 768 && window.innerWidth < TABLET_MAX) usePortfolioStore.setState({ isRightSidebarOpen: false });
    // Lets E2E tests (and anything else) wait until event handlers are attached.
    document.documentElement.dataset.hydrated = 'true';
  }, [hydrateFromStorage]);

  useKeyboardShortcuts();
  usePlaybackTimer();
  useUrlSync();

  return (
    <div
      className="flex h-[100dvh] w-full flex-col overflow-hidden bg-black text-white select-none"
      onContextMenu={(e) => {
        // Spotify suppresses the browser menu everywhere except text fields.
        const target = e.target as HTMLElement;
        if (!target.closest('input, textarea, a, .select-text')) e.preventDefault();
      }}
    >
      {/* Desktop/tablet chrome is CSS-gated (`hidden md:contents`), so the static HTML
          never shows the wrong layout on a phone before React loads. */}
      {/* Zone 1: Top bar (64px) */}
      <div className="hidden md:contents">
        <TopNavBar />
      </div>

      {/* Zones 2–4: Library, centre stage and Now Playing view, separated by 8px gutters */}
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden md:px-2">
        <div className="hidden md:contents">
          <LeftSidebar forceCollapsed={railLibrary} />
        </div>
        <CenterStage />
        <div className="hidden md:contents">
          <RightSidebar />
        </div>
      </div>

      {/* Zone 5: Player bar (72px) */}
      <div className="hidden md:contents">
        <BottomPlayerBar />
      </div>

      {/* Phones: tab bar, mini-player, full player, drawer, search, queue sheet */}
      <MobileChrome />

      {/* Overlays */}
      <AISearchDropdown />
      <SendMixModal />
      <ThemeSwitcherModal />
      <KeyboardShortcutsModal />
      <ContextMenu />
      <Toast />
      {process.env.NODE_ENV === 'development' && <DevEditButton />}
    </div>
  );
}
