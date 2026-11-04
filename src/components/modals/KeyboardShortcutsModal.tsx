import React from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile } from '@/data/portfolioData';
import { Dialog } from './Dialog';

const SECTIONS: { title: string; rows: [string, string[]][] }[] = [
  {
    title: 'Basic',
    rows: [
      [`Search / ask ${candidateProfile.firstName}’s AI`, ['Ctrl', 'K']],
      ['Search (alternative)', ['Ctrl', 'L']],
      ['Keyboard shortcuts', ['Ctrl', '/']],
      ['Close menu, dialog or lyrics', ['Esc']],
    ],
  },
  {
    title: 'Playback',
    rows: [
      ['Play / pause', ['Space']],
      ['Next track', ['Ctrl', '→']],
      ['Previous track', ['Ctrl', '←']],
      ['Volume up', ['Ctrl', '↑']],
      ['Volume down', ['Ctrl', '↓']],
      ['Shuffle', ['Alt', 'S']],
      ['Repeat', ['Alt', 'R']],
    ],
  },
  {
    title: 'Navigation',
    rows: [
      ['Go back', ['Alt', '←']],
      ['Go forward', ['Alt', '→']],
      ['Collapse / expand library', ['Alt', 'Shift', 'L']],
      ['Toggle Now Playing view', ['Alt', 'Shift', 'R']],
    ],
  },
];

/** Mirrors Spotify's Ctrl+/ keyboard-shortcuts sheet. */
export const KeyboardShortcutsModal: React.FC = () => {
  const isOpen = usePortfolioStore((s) => s.isShortcutsModalOpen);
  const setOpen = usePortfolioStore((s) => s.setShortcutsModalOpen);

  if (!isOpen) return null;

  return (
    <Dialog title="Keyboard shortcuts" onClose={() => setOpen(false)} width={560} testId="shortcuts-modal">
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h3 className="mb-2 text-base font-bold">{section.title}</h3>
            <ul>
              {section.rows.map(([label, keys]) => (
                <li key={label} className="flex items-center justify-between py-2 text-sm text-subdued">
                  <span>{label}</span>
                  <span className="flex gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="min-w-[28px] rounded bg-[rgba(255,255,255,0.1)] px-2 py-0.5 text-center font-spotify text-xs font-bold text-white"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-xs text-subdued">On macOS, use ⌘ instead of Ctrl and ⌥ instead of Alt.</p>
      </div>
    </Dialog>
  );
};
