import React from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

/**
 * Spotify notification toast: solid blue (#2e77d0) rounded rectangle centred
 * above the player bar, white 14px text, fades up in and disappears after 3s.
 */
export const Toast: React.FC = () => {
  const toastMessage = usePortfolioStore((state) => state.toastMessage);
  const toastId = usePortfolioStore((state) => state.toastId);
  const hideToast = usePortfolioStore((state) => state.hideToast);

  if (!toastMessage) return null;

  return (
    <div
      key={toastId}
      role="status"
      aria-live="polite"
      onClick={hideToast}
      className="fixed bottom-[96px] left-1/2 z-[120] max-w-[480px] -translate-x-1/2 cursor-default rounded-lg bg-toast px-4 py-3 text-center text-sm text-white shadow-spotify-elevated animate-toast-in"
    >
      {toastMessage}
    </div>
  );
};
