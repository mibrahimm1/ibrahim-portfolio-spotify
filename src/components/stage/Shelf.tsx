import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useStage } from './StageContext';

interface ShelfProps {
  title: string;
  subtitle?: string;
  /** Number of items, used to decide whether "Show all" is needed. */
  itemCount: number;
  onShowAll?: () => void;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

const MIN_CARD_WIDTH = 180;
const GAP = 24;

/**
 * Spotify home/profile shelf: section title + "Show all", and a single row of
 * cards that fills the available width (grid-auto-rows: 0 hides the overflow).
 */
export const Shelf: React.FC<ShelfProps> = ({ title, subtitle, itemCount, onShowAll, children, className, testId }) => {
  const { width } = useStage();
  const [expanded, setExpanded] = useState(false);
  const columns = Math.max(2, Math.floor((width - 48 + GAP) / (MIN_CARD_WIDTH + GAP)));
  const overflow = itemCount > columns;

  return (
    <section className={cn('px-6 pt-6', className)} data-testid={testId}>
      <div className="mb-2 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="text-sm text-subdued">{subtitle}</p>}
        </div>
        {(overflow || onShowAll) && (
          <button
            type="button"
            onClick={() => (onShowAll ? onShowAll() : setExpanded((v) => !v))}
            className="flex-shrink-0 pb-1 text-sm font-bold text-subdued hover:underline"
          >
            {expanded ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>
      <div
        className="-mx-3 grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: '1fr',
          gridAutoRows: expanded ? 'auto' : 0,
          columnGap: GAP - 12,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </section>
  );
};
