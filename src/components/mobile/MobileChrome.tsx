import React from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { QueuePanel } from '@/components/inspector/QueuePanel';
import { BottomTabBar } from './BottomTabBar';
import { MiniPlayer } from './MiniPlayer';
import { FullPlayer } from './FullPlayer';
import { ProfileDrawer } from './ProfileDrawer';
import { MobileSearch } from './MobileSearch';
import { BottomSheet } from './BottomSheet';

/** Everything that only exists in the phone layout. Each piece hides itself at `md`. */
export const MobileChrome: React.FC = () => {
  const queueOpen = usePortfolioStore((s) => s.isQueueSheetOpen);
  const setQueueOpen = usePortfolioStore((s) => s.setQueueSheetOpen);
  return (
    <>
      <MiniPlayer />
      <BottomTabBar />
      <FullPlayer />
      <ProfileDrawer />
      <MobileSearch />
      {queueOpen && (
        <BottomSheet onClose={() => setQueueOpen(false)} label="Queue" testId="m-queue-sheet" tall>
          <QueuePanel onClose={() => setQueueOpen(false)} />
        </BottomSheet>
      )}
    </>
  );
};
