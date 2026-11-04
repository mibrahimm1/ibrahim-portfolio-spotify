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
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { useKeyboardShortcuts, usePlaybackTimer, useUrlSync } from '@/lib/hooks';

// Below this width with the Now Playing view open, the library folds into its
// icon rail so the centre stage keeps a usable width (as the desktop client does).
const NARROW_WINDOW = 1240;

function useIsNarrowWindow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const update = () => setNarrow(window.innerWidth < NARROW_WINDOW);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return narrow;
}

export default function Home() {
  const hydrateFromStorage = usePortfolioStore((state) => state.hydrateFromStorage);
  const isRightSidebarOpen = usePortfolioStore((state) => state.isRightSidebarOpen);
  const narrow = useIsNarrowWindow();

  useEffect(() => {
    hydrateFromStorage();
    // Lets E2E tests (and anything else) wait until event handlers are attached.
    document.documentElement.dataset.hydrated = 'true';
  }, [hydrateFromStorage]);

  useKeyboardShortcuts();
  usePlaybackTimer();
  useUrlSync();

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden bg-black text-white select-none"
      onContextMenu={(e) => {
        // Spotify suppresses the browser menu everywhere except text fields.
        const target = e.target as HTMLElement;
        if (!target.closest('input, textarea, a, .select-text')) e.preventDefault();
      }}
    >
      {/* Zone 1: Top bar (64px) */}
      <TopNavBar />

      {/* Zones 2–4: Library, centre stage and Now Playing view, separated by 8px gutters */}
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden px-2">
        <LeftSidebar forceCollapsed={narrow && isRightSidebarOpen} />
        <CenterStage />
        <RightSidebar />
      </div>

      {/* Zone 5: Player bar (72px) */}
      <BottomPlayerBar />

      {/* Overlays */}
      <AISearchDropdown />
      <SendMixModal />
      <ThemeSwitcherModal />
      <KeyboardShortcutsModal />
      <ContextMenu />
      <Toast />
    </div>
  );
}
