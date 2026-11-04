import React, { useEffect, useState } from 'react';
import { useDashboard } from './context';
import { MiniButton } from './fields';
import { Path, RefKind, Reference, cleanReferences, findReferences, getAt, moveIndex, setAt, uniqueId } from './model';
import type { PortfolioContent } from '@/content/schema';
import { ChevronRightIcon, CloseIcon, PlusIcon } from '@/components/common/Icons';
import { cn } from '@/lib/utils';

type Item = Record<string, unknown>;

interface ListEditorProps {
  path: Path;
  /** Singular noun for buttons and dialogs ("project", "theme"). */
  noun: string;
  itemTitle: (item: Item, index: number) => string;
  itemSubtitle?: (item: Item, index: number) => string;
  newItem: (draft: PortfolioContent) => Item;
  renderItem: (itemPath: Path, index: number) => React.ReactNode;
  /** Items with an `id` that other content can point at. */
  refKind?: RefKind;
  /** Extra references to check on delete (e.g. a playlist's tracks). */
  extraRefs?: (draft: PortfolioContent, item: Item) => { kind: RefKind; id: string; refs: Reference[] }[];
  /** Ids already in use, for unique ids when duplicating. Omit for id-less items. */
  takenIds?: (draft: PortfolioContent) => string[];
  minItems?: number;
  openId?: string;
  onOpen?: (item: Item | null) => void;
  leading?: (item: Item) => React.ReactNode;
  emptyText?: string;
}

/**
 * Generic editor for an array of objects: add, duplicate, delete (with a reference check),
 * reorder by drag or ↑/↓, and an inline detail panel per item.
 */
export const ListEditor: React.FC<ListEditorProps> = ({
  path,
  noun,
  itemTitle,
  itemSubtitle,
  newItem,
  renderItem,
  refKind,
  extraRefs,
  takenIds,
  minItems = 0,
  openId,
  onOpen,
  leading,
  emptyText,
}) => {
  const { draft, update, replace, countUnder, confirm, notify } = useDashboard();
  const items = (getAt(draft, path) as Item[] | undefined) ?? [];
  const [open, setOpen] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  // Deep links (e.g. from "Edit in dashboard") open a specific item.
  useEffect(() => {
    if (!openId) return;
    const index = items.findIndex((it) => it.id === openId);
    if (index >= 0) setOpen(index);
    // Only react to a new deep link, not to every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const toggle = (index: number) => {
    const next = open === index ? null : index;
    setOpen(next);
    onOpen?.(next === null ? null : items[next]);
  };

  const add = () => {
    const item = newItem(draft);
    update(path, [...items, item]);
    setOpen(items.length);
    onOpen?.(item);
  };

  const duplicate = (index: number) => {
    const copy = structuredClone(items[index]);
    if (takenIds && typeof copy.id === 'string') copy.id = uniqueId(`${copy.id}-copy`, takenIds(draft));
    if (Array.isArray(copy.tracks) && takenIds) {
      // Duplicated playlists need fresh track ids too (track ids are unique site-wide).
      const taken = draft.playlists.flatMap((p) => p.tracks.map((t) => t.id));
      copy.tracks = (copy.tracks as Item[]).map((t) => {
        const id = uniqueId(`${t.id}-copy`, taken);
        taken.push(id);
        return { ...t, id };
      });
    }
    const next = [...items];
    next.splice(index + 1, 0, copy);
    update(path, next);
    setOpen(index + 1);
  };

  const remove = async (index: number) => {
    const item = items[index];
    if (items.length <= minItems) {
      notify(`Keep at least ${minItems} ${noun}${minItems === 1 ? '' : 's'}`, 'error');
      return;
    }
    const groups: { kind: RefKind; id: string; refs: Reference[] }[] = [];
    if (refKind && typeof item.id === 'string') groups.push({ kind: refKind, id: item.id, refs: findReferences(draft, refKind, item.id) });
    if (extraRefs) groups.push(...extraRefs(draft, item));
    const refs = groups.flatMap((g) => g.refs);
    const required = refs.filter((r) => r.required);

    const ok = await confirm({
      title: `Delete this ${noun}?`,
      danger: true,
      confirmLabel: 'Delete',
      body: (
        <div className="space-y-3 text-sm">
          <p>
            <span className="font-bold">“{itemTitle(item, index)}”</span> will be removed from your draft. Nothing is
            written to disk until you save.
          </p>
          {refs.length > 0 && (
            <div className="rounded bg-[rgba(255,255,255,0.07)] p-3">
              <p className="mb-1 font-bold">It is used in {refs.length} place{refs.length === 1 ? '' : 's'}:</p>
              <ul className="list-disc space-y-0.5 pl-5 text-subdued">
                {refs.map((r, i) => (
                  <li key={i}>
                    {r.label}
                    {r.required && <span className="text-[#f3727f]"> (needs a replacement)</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-subdued">
                Optional references are cleared automatically.
                {required.length > 0 && ' Required ones will be flagged so you can pick a replacement before saving.'}
              </p>
            </div>
          )}
        </div>
      ),
    });
    if (!ok) return;
    replace((d) => {
      let next = setAt(d, path, ((getAt(d, path) as Item[]) ?? []).filter((_, i) => i !== index));
      for (const g of groups) next = cleanReferences(next, g.kind, g.id);
      return next;
    });
    setOpen(null);
    onOpen?.(null);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    update(path, moveIndex(items, from, to));
    if (open === from) setOpen(to);
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="rounded-lg border border-dashed border-[#3e3e3e] p-4 text-sm text-subdued">{emptyText ?? `No ${noun}s yet.`}</p>}
      <ul className="space-y-2">
        {items.map((item, index) => {
          const problems = countUnder([...path, index]);
          const isOpen = open === index;
          return (
            <li
              key={typeof item.id === 'string' ? `${item.id}-${index}` : index}
              onDragOver={(e) => dragging !== null && e.preventDefault()}
              onDrop={() => {
                if (dragging !== null) move(dragging, index);
                setDragging(null);
              }}
              className={cn('rounded-lg bg-[rgba(255,255,255,0.04)]', isOpen && 'bg-[rgba(255,255,255,0.06)] ring-1 ring-[#3e3e3e]', dragging === index && 'opacity-40')}
            >
              <div className="flex items-center gap-2 py-1.5 pl-2 pr-1.5">
                <span
                  draggable
                  onDragStart={() => setDragging(index)}
                  onDragEnd={() => setDragging(null)}
                  title="Drag to reorder"
                  aria-hidden="true"
                  className="cursor-grab select-none px-1 text-lg leading-none text-[#6a6a6a] hover:text-white"
                >
                  ⠿
                </span>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded py-1 text-left"
                >
                  <ChevronRightIcon size={12} className={cn('flex-shrink-0 text-subdued transition-transform', isOpen && 'rotate-90')} />
                  {leading?.(item)}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{itemTitle(item, index) || <em className="text-subdued">Untitled</em>}</span>
                    {itemSubtitle && <span className="block truncate text-xs text-subdued">{itemSubtitle(item, index)}</span>}
                  </span>
                  {problems > 0 && (
                    <span className="ml-auto flex-shrink-0 rounded-full bg-[#f3727f] px-2 py-0.5 text-[11px] font-bold text-black">
                      {problems} {problems === 1 ? 'problem' : 'problems'}
                    </span>
                  )}
                </button>
                <div className="flex flex-shrink-0 items-center">
                  <MiniButton label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}>
                    <ChevronRightIcon size={12} className="-rotate-90" />
                  </MiniButton>
                  <MiniButton label="Move down" disabled={index === items.length - 1} onClick={() => move(index, index + 1)}>
                    <ChevronRightIcon size={12} className="rotate-90" />
                  </MiniButton>
                  <MiniButton label={`Duplicate ${noun}`} onClick={() => duplicate(index)}>
                    <PlusIcon size={12} />
                  </MiniButton>
                  <MiniButton label={`Delete ${noun}`} danger onClick={() => remove(index)}>
                    <CloseIcon size={12} />
                  </MiniButton>
                </div>
              </div>
              {isOpen && <div className="space-y-4 border-t border-[rgba(255,255,255,0.08)] p-4">{renderItem([...path, index], index)}</div>}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-full border border-[#535353] px-4 py-1.5 text-sm font-bold hover:border-white"
      >
        <PlusIcon size={12} /> Add {noun}
      </button>
    </div>
  );
};
