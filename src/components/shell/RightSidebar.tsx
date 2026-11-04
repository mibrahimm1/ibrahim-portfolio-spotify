import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore, RIGHT_SIDEBAR } from '@/stores/usePortfolioStore';
import { NowPlayingInspector } from '@/components/inspector/NowPlayingInspector';
import { QueuePanel } from '@/components/inspector/QueuePanel';
import { ListeningActivity } from '@/components/activity/ListeningActivity';
import { ResizeHandle } from './ResizeHandle';

export const RightSidebar: React.FC = () => {
  const { rightSidebarMode, isRightSidebarOpen, width } = usePortfolioStore(
    useShallow((s) => ({
      rightSidebarMode: s.rightSidebarMode,
      isRightSidebarOpen: s.isRightSidebarOpen,
      width: s.rightSidebarWidth,
    }))
  );
  const setRightSidebarWidth = usePortfolioStore((s) => s.setRightSidebarWidth);

  if (!isRightSidebarOpen) {
    return null;
  }

  return (
    <div className="relative h-full flex-shrink-0" style={{ width }}>
      <aside
        data-testid="right-sidebar"
        aria-label={rightSidebarMode === 'activity' ? 'Friend Activity' : rightSidebarMode === 'queue' ? 'Queue' : 'Now playing view'}
        className="flex h-full flex-col overflow-hidden rounded-lg bg-surface"
      >
        {rightSidebarMode === 'inspector' && <NowPlayingInspector />}
        {rightSidebarMode === 'queue' && <QueuePanel />}
        {rightSidebarMode === 'activity' && <ListeningActivity />}
      </aside>
      <ResizeHandle
        edge="left"
        width={width}
        min={RIGHT_SIDEBAR.min}
        max={RIGHT_SIDEBAR.max}
        label="Resize Now Playing view"
        onResize={setRightSidebarWidth}
      />
    </div>
  );
};
