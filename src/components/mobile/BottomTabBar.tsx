import React from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { HomeIcon, LibraryIcon, MailIcon, SearchIcon } from '@/components/common/Icons';
import { MobileTab } from '@/types/portfolio';
import { cn } from '@/lib/utils';

const ROOT_VIEW: Record<MobileTab, string> = { home: 'home', search: 'browse', library: 'library', contact: 'contact' };

/**
 * Spotify's phone tab bar: four tabs over a black fade, white filled icon for the active
 * tab. Contact takes the slot Spotify uses for Premium. Tapping the active tab again
 * scrolls its page back to the top, as the app does.
 */
export const BottomTabBar: React.FC = () => {
  const tab = usePortfolioStore((s) => s.mobileTab);
  const activeView = usePortfolioStore((s) => s.activeView);
  const navigateHome = usePortfolioStore((s) => s.navigateHome);
  const navigateToBrowse = usePortfolioStore((s) => s.navigateToBrowse);
  const navigateToLibrary = usePortfolioStore((s) => s.navigateToLibrary);
  const navigateToContact = usePortfolioStore((s) => s.navigateToContact);

  const go = (target: MobileTab) => {
    if (target === tab && activeView === ROOT_VIEW[target]) {
      document.querySelector('[data-testid="center-stage"]')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (target === 'home') navigateHome();
    else if (target === 'search') navigateToBrowse();
    else if (target === 'library') navigateToLibrary();
    else navigateToContact();
  };

  const tabs: { id: MobileTab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: (active) => <HomeIcon size={24} active={active} /> },
    { id: 'search', label: 'Search', icon: () => <SearchIcon size={24} /> },
    { id: 'library', label: 'Your Library', icon: () => <LibraryIcon size={24} /> },
    { id: 'contact', label: 'Contact', icon: () => <MailIcon size={22} /> },
  ];

  return (
    <nav
      aria-label="Main"
      data-testid="m-tab-bar"
      className="fixed inset-x-0 bottom-0 z-[60] bg-gradient-to-t from-black from-40% via-[rgba(0,0,0,0.85)] to-transparent pb-safe pt-3 md:hidden"
    >
      <ul className="flex h-14 items-stretch">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <li key={t.id} className="flex-1">
              <button
                type="button"
                onClick={() => go(t.id)}
                aria-current={active ? 'page' : undefined}
                data-testid={`m-tab-${t.id}`}
                className={cn(
                  'flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] transition-transform active:scale-95',
                  active ? 'text-white' : 'text-subdued'
                )}
              >
                {t.icon(active)}
                <span className={cn(active && 'font-bold')}>{t.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
