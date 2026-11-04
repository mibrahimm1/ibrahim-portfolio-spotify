import React from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { accentThemes } from '@/data/portfolioData';
import { AccentThemeId } from '@/types/portfolio';
import { CheckIcon } from '@/components/common/Icons';
import { cn } from '@/lib/utils';
import { Dialog } from './Dialog';

export const ThemeSwitcherModal: React.FC = () => {
  const isThemeModalOpen = usePortfolioStore((s) => s.isThemeModalOpen);
  const setThemeModalOpen = usePortfolioStore((s) => s.setThemeModalOpen);
  const activeAccentTheme = usePortfolioStore((s) => s.activeAccentTheme);
  const setAccentTheme = usePortfolioStore((s) => s.setAccentTheme);
  const showToast = usePortfolioStore((s) => s.showToast);

  if (!isThemeModalOpen) return null;

  return (
    <Dialog title="Accent colour" onClose={() => setThemeModalOpen(false)} width={420} testId="theme-selector-popover">
      <p className="-mt-4 mb-4 text-sm text-subdued">Recolours buttons, progress bars, active tracks and the profile header.</p>
      <div role="radiogroup" aria-label="Accent colour" className="space-y-1">
        {(Object.keys(accentThemes) as AccentThemeId[]).map((themeKey) => {
          const theme = accentThemes[themeKey];
          const isSelected = activeAccentTheme === themeKey;

          return (
            <button
              key={themeKey}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-autofocus={isSelected ? true : undefined}
              onClick={() => {
                setAccentTheme(themeKey);
                showToast(`Accent colour changed to ${theme.name}`);
                setThemeModalOpen(false);
              }}
              data-testid={`theme-swatch-${themeKey}`}
              className={cn(
                'flex h-14 w-full items-center gap-3 rounded-md px-3 text-left transition-colors',
                isSelected ? 'bg-[rgba(255,255,255,0.1)]' : 'hover:bg-[rgba(255,255,255,0.07)]'
              )}
            >
              <span className="h-8 w-8 flex-shrink-0 rounded-full" style={{ backgroundColor: theme.primary }} />
              <span className="min-w-0 flex-1">
                <span className={cn('block text-base', isSelected ? 'text-accent' : 'text-white')}>{theme.name}</span>
                <span className="block font-mono text-xs uppercase text-subdued">{theme.primary}</span>
              </span>
              {isSelected && <CheckIcon size={16} className="text-accent" />}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-subdued">Saved in this browser.</p>
    </Dialog>
  );
};
