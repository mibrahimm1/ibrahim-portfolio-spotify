import React, { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../context';
import { Card, Section } from '../fields';
import { api, formatBytes, uploadFile } from '../api';
import { usedUploads } from '../model';
import { PortfolioSchema } from '@/content/schema';
import { spotifyButtonClasses } from '@/components/common/SpotifyButton';
import { cn } from '@/lib/utils';

/* ------------------------------- Media ---------------------------------- */

export const MediaSection: React.FC = () => {
  const { draft, uploads, refreshUploads, confirm, notify } = useDashboard();
  const imageRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const used = usedUploads(draft);

  const upload = async (file: File | undefined, kind: 'image' | 'pdf') => {
    if (!file) return;
    const res = await uploadFile(file, kind);
    if (res.ok) {
      notify(`Uploaded ${file.name} as ${res.path}`);
      await refreshUploads();
    } else notify(res.error ?? 'Upload failed', 'error');
  };

  const remove = async (name: string, path: string) => {
    const inUse = used.has(path);
    const ok = await confirm({
      title: 'Delete this file?',
      danger: true,
      confirmLabel: 'Delete file',
      body: inUse ? (
        <p className="text-sm">
          <span className="font-bold text-[#f3727f]">Your draft still uses this file.</span> Deleting it breaks those images until you pick
          another. This deletes the file from disk immediately.
        </p>
      ) : (
        <p className="text-sm">This deletes {name} from public/uploads immediately.</p>
      ),
    });
    if (!ok) return;
    const res = await api('DELETE', `/uploads?name=${encodeURIComponent(name)}`);
    if (res.ok) {
      notify(`Deleted ${name}`);
      await refreshUploads();
    } else notify(String((res.data as { error?: string }).error ?? 'Delete failed'), 'error');
  };

  return (
    <Section
      title="Media library"
      description="Files uploaded through the dashboard, stored in public/uploads/ and committed with your content. Only PNG, JPEG, WebP, AVIF and PDF are accepted, checked by file contents."
      actions={
        <div className="flex gap-2">
          <button type="button" onClick={() => imageRef.current?.click()} className={spotifyButtonClasses('white', 'sm')}>
            Upload image
          </button>
          <button type="button" onClick={() => pdfRef.current?.click()} className={spotifyButtonClasses('secondary', 'sm')}>
            Upload PDF
          </button>
          <input ref={imageRef} type="file" hidden accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => upload(e.target.files?.[0], 'image')} />
          <input ref={pdfRef} type="file" hidden accept="application/pdf" onChange={(e) => upload(e.target.files?.[0], 'pdf')} />
        </div>
      }
    >
      {uploads.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#3e3e3e] p-6 text-sm text-subdued">
          No uploads yet. Upload here, or use the Upload buttons on any image field.
        </p>
      ) : (
        <ul className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {uploads.map((u) => {
            const inUse = used.has(u.path);
            return (
              <li key={u.name} className="overflow-hidden rounded-lg bg-[rgba(255,255,255,0.04)]">
                <div className="flex aspect-square items-center justify-center bg-[#181818]">
                  {u.name.endsWith('.pdf') ? (
                    <span className="text-sm font-bold text-subdued">PDF</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- dev-only thumbnail
                    <img src={u.path} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate font-mono text-xs" title={u.name}>
                    {u.name}
                  </p>
                  <p className="flex items-center justify-between text-xs text-subdued">
                    {formatBytes(u.size)}
                    <span className={cn('rounded-full px-2 py-0.5 font-bold', inUse ? 'bg-[#1ed76033] text-[#1ed760]' : 'bg-[#ffa42b33] text-[#ffa42b]')}>
                      {inUse ? 'In use' : 'Unused'}
                    </span>
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(u.path).then(() => notify('Path copied'))}
                      className="text-xs font-bold text-subdued hover:text-white"
                    >
                      Copy path
                    </button>
                    <button type="button" onClick={() => remove(u.name, u.path)} className="text-xs font-bold text-subdued hover:text-[#f3727f]">
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
};

/* ------------------------------ Raw JSON -------------------------------- */

export const RawJsonSection: React.FC = () => {
  const { draft, replace, notify } = useDashboard();
  const [text, setText] = useState(() => JSON.stringify(draft, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [dirtyText, setDirtyText] = useState(false);

  // Follow form edits unless the user is mid-way through editing the JSON here.
  useEffect(() => {
    if (!dirtyText) setText(JSON.stringify(draft, null, 2));
  }, [draft, dirtyText]);

  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      replace(() => parsed);
      setDirtyText(false);
      setError(null);
      const valid = PortfolioSchema.safeParse(parsed).success;
      notify(valid ? 'JSON applied to the draft' : 'JSON applied: it has problems, see the badges in the menu', valid ? 'info' : 'error');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return (
    <Section title="Raw JSON" description="The whole draft as content/portfolio.json will store it. Apply puts your edits into the draft; Save writes it to disk.">
      <textarea
        value={text}
        spellCheck={false}
        aria-label="Content JSON"
        onChange={(e) => {
          setText(e.target.value);
          setDirtyText(true);
        }}
        className="spotify-input h-[60vh] resize-y font-mono text-xs leading-relaxed"
      />
      {error && <p className="text-sm text-[#f3727f]">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={apply} disabled={!dirtyText} className={cn(spotifyButtonClasses('white', 'sm'), 'disabled:opacity-40')}>
          Apply to draft
        </button>
        <button
          type="button"
          disabled={!dirtyText}
          onClick={() => {
            setText(JSON.stringify(draft, null, 2));
            setDirtyText(false);
            setError(null);
          }}
          className={cn(spotifyButtonClasses('secondary', 'sm'), 'disabled:opacity-40')}
        >
          Discard JSON edits
        </button>
      </div>
    </Section>
  );
};

/* ------------------------------ Backups --------------------------------- */

interface Backup {
  name: string;
  size: number;
  mtimeMs: number;
}

export const BackupsSection: React.FC<{ onRestored: () => Promise<void> }> = ({ onRestored }) => {
  const { confirm, notify } = useDashboard();
  const [backups, setBackups] = useState<Backup[] | null>(null);

  const load = async () => {
    const res = await api<{ backups: Backup[] }>('GET', '/backups');
    setBackups(res.ok ? res.data.backups : []);
  };

  useEffect(() => {
    void load();
  }, []);

  const restore = async (name: string) => {
    const ok = await confirm({
      title: 'Restore this backup?',
      confirmLabel: 'Restore',
      body: (
        <p className="text-sm">
          content/portfolio.json will be replaced with <span className="font-mono">{name}</span>. The current file is backed up first, and
          any unsaved changes in the dashboard are discarded.
        </p>
      ),
    });
    if (!ok) return;
    const res = await api('POST', '/backups', { name });
    if (!res.ok) {
      notify(String((res.data as { error?: string }).error ?? 'Restore failed'), 'error');
      return;
    }
    notify(`Restored ${name}`);
    await onRestored();
    await load();
  };

  return (
    <Section title="Backups" description="Every save first copies the previous file to content/.backups/ (the last 20 are kept; the folder is git-ignored).">
      <Card>
        {backups === null ? (
          <p className="text-sm text-subdued">Loading…</p>
        ) : backups.length === 0 ? (
          <p className="text-sm text-subdued">No backups yet. One is made the first time you save.</p>
        ) : (
          <ul className="divide-y divide-[rgba(255,255,255,0.08)]">
            {backups.map((b) => (
              <li key={b.name} className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm">{new Date(b.mtimeMs).toLocaleString()}</p>
                  <p className="truncate font-mono text-xs text-subdued">
                    {b.name} · {formatBytes(b.size)}
                  </p>
                </div>
                <button type="button" onClick={() => restore(b.name)} className={spotifyButtonClasses('secondary', 'sm')}>
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Section>
  );
};
