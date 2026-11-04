import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { PortfolioContent } from '@/content/schema';
import { PortfolioSchema } from '@/content/schema';
import { Dialog } from '@/components/modals/Dialog';
import { spotifyButtonClasses } from '@/components/common/SpotifyButton';
import { cn } from '@/lib/utils';
import { api, UploadInfo } from './api';
import { ConfirmOptions, DashboardContext, DashboardContextValue, Focus } from './context';
import { Path, pathKey, setAt } from './model';
import { PlaylistsSection, RecommendersSection, TechnologiesSection } from './sections/ContentSections';
import {
  AiSection,
  CoverLetterSection,
  ExtrasSection,
  HomeSection,
  ProfileSection,
  ResumeSection,
  SiteSection,
  ThemesSection,
} from './sections/ProfileSections';
import { BackupsSection, MediaSection, RawJsonSection } from './sections/ToolSections';

type SectionKey =
  | 'profile'
  | 'site'
  | 'home'
  | 'playlists'
  | 'technologies'
  | 'recommenders'
  | 'ai'
  | 'coverLetter'
  | 'themes'
  | 'extras'
  | 'resume'
  | 'media'
  | 'raw'
  | 'backups';

/** Nav entries and the top-level content keys whose problems they count. */
const SECTIONS: { key: SectionKey; label: string; roots: string[]; preview?: string; group?: string }[] = [
  { key: 'profile', label: 'Profile', roots: ['profile'], group: 'Content' },
  { key: 'home', label: 'Home page', roots: ['home', 'recruiterMix'] },
  { key: 'playlists', label: 'Playlists & items', roots: ['playlists'] },
  { key: 'technologies', label: 'Tech stack', roots: ['technologies'] },
  { key: 'recommenders', label: 'Recommenders', roots: ['recommenders'] },
  { key: 'ai', label: 'AI assistant', roots: ['ai', 'starterPrompts'] },
  { key: 'coverLetter', label: 'Cover letter', roots: ['coverLetterStanzas'], preview: '#/lyrics' },
  { key: 'resume', label: 'Resume page', roots: ['resume'], preview: '/resume' },
  { key: 'themes', label: 'Accent themes', roots: ['accentThemes'], group: 'Settings' },
  { key: 'extras', label: "What's New & footer", roots: ['whatsNew', 'footer'] },
  { key: 'site', label: 'Site & SEO', roots: ['site', 'schemaVersion'] },
  { key: 'media', label: 'Media library', roots: [], group: 'Tools' },
  { key: 'raw', label: 'Raw JSON', roots: [] },
  { key: 'backups', label: 'Backups', roots: [] },
];

interface Toast {
  id: number;
  message: string;
  tone: 'info' | 'error';
}

/** "#track/project-konvex" (from the site's dev-only "Edit" links) → section + item to open. */
function parseDeepLink(hash: string): { section?: SectionKey; focus: Focus } {
  const [kind, id] = hash.replace(/^#/, '').split('/').map(decodeURIComponent);
  if (kind === 'track' && id) return { section: 'playlists', focus: { track: id } };
  if (kind === 'playlist' && id) return { section: 'playlists', focus: { playlist: id } };
  if (kind === 'recommender' && id) return { section: 'recommenders', focus: { recommender: id } };
  if (kind === 'technology' && id) return { section: 'technologies', focus: { technology: id } };
  if (SECTIONS.some((s) => s.key === kind)) return { section: kind as SectionKey, focus: {} };
  return { focus: {} };
}

let toastId = 0;

export const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [draft, setDraft] = useState<PortfolioContent | null>(null);
  const [savedJson, setSavedJson] = useState('');
  const [mtime, setMtime] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<SectionKey>('profile');
  const [focus, setFocus] = useState<Focus>({});
  const [uploads, setUploads] = useState<UploadInfo[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{ options: ConfirmOptions; resolve: (ok: boolean) => void } | null>(null);
  const [conflict, setConflict] = useState(false);
  const [preview, setPreview] = useState('/');
  const [showPreview, setShowPreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const importRef = useRef<HTMLInputElement>(null);

  /* ------------------------------ Loading ------------------------------- */

  const load = useCallback(async () => {
    const res = await api<{ content: PortfolioContent; mtimeMs: number; error?: string }>('GET', '/content');
    if (!res.ok) {
      setStatus('error');
      setLoadError(res.data.error ?? `The dashboard API answered ${res.status}`);
      return;
    }
    setDraft(res.data.content);
    setSavedJson(JSON.stringify(res.data.content));
    setMtime(res.data.mtimeMs);
    setStatus('ready');
  }, []);

  const refreshUploads = useCallback(async () => {
    const res = await api<{ uploads: UploadInfo[] }>('GET', '/uploads');
    if (res.ok) setUploads(res.data.uploads);
  }, []);

  useEffect(() => {
    void load();
    void refreshUploads();
    const followHash = () => {
      const { section: linked, focus: linkedFocus } = parseDeepLink(window.location.hash);
      if (linked) setSection(linked);
      setFocus(linkedFocus);
      // Show the linked item in the preview too.
      if (linkedFocus.playlist) setPreview(`/#/playlist/${encodeURIComponent(linkedFocus.playlist)}`);
      else if (linkedFocus.recommender) setPreview(`/#/user/${encodeURIComponent(linkedFocus.recommender)}`);
      else if (linkedFocus.technology) setPreview(`/#/playlist/tech%3A${encodeURIComponent(linkedFocus.technology)}`);
    };
    followHash();
    window.addEventListener('hashchange', followHash);
    return () => window.removeEventListener('hashchange', followHash);
  }, [load, refreshUploads]);

  /* ----------------------------- Validation ----------------------------- */

  const deferredDraft = useDeferredValue(draft);
  const issues = useMemo(() => {
    if (!deferredDraft) return [];
    const result = PortfolioSchema.safeParse(deferredDraft);
    return result.success ? [] : result.error.issues.map((i) => ({ path: i.path as Path, message: i.message }));
  }, [deferredDraft]);

  const errorsByPath = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const issue of issues) {
      const key = pathKey(issue.path);
      map.set(key, [...(map.get(key) ?? []), issue.message]);
    }
    return map;
  }, [issues]);

  const dirty = !!draft && JSON.stringify(draft) !== savedJson;
  const valid = issues.length === 0;

  /* ------------------------------ Helpers ------------------------------- */

  const notify = useCallback((message: string, tone: 'info' | 'error' = 'info') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 6000 : 3500);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setConfirmState({ options, resolve })),
    []
  );

  const closeConfirm = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirmState(null);
  };

  /* ------------------------------ Saving -------------------------------- */

  const save = useCallback(
    async (force = false) => {
      if (!draft || saving) return;
      if (!valid) {
        notify(`Fix ${issues.length} problem${issues.length === 1 ? '' : 's'} before saving`, 'error');
        return;
      }
      setSaving(true);
      const res = await api<{ error?: string; mtimeMs?: number }>('PUT', '/content', { content: draft, baseMtime: mtime, force });
      setSaving(false);
      if (res.status === 409) {
        setConflict(true);
        return;
      }
      if (!res.ok) {
        notify(res.data.error ?? 'Save failed', 'error');
        return;
      }
      setConflict(false);
      await load(); // pick up the normalised file the server wrote (trimmed strings, key order)
      notify('Saved to content/portfolio.json. The preview reloads by itself.');
    },
    [draft, saving, valid, issues.length, mtime, notify, load]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  /* ---------------------------- Toolbar actions ------------------------- */

  const revert = async () => {
    if (await confirm({ title: 'Discard unsaved changes?', body: <p className="text-sm">The draft goes back to the last saved file.</p>, confirmLabel: 'Discard', danger: true })) {
      setDraft(JSON.parse(savedJson));
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      setDraft(parsed);
      notify(`Imported ${file.name} into the draft. Review it, then Save.`);
    } catch {
      notify(`${file.name} isn't valid JSON`, 'error');
    }
    if (importRef.current) importRef.current.value = '';
  };

  const resetToTemplate = async () => {
    const ok = await confirm({
      title: 'Start from the example template?',
      danger: true,
      confirmLabel: 'Load template',
      body: (
        <p className="text-sm">
          The draft is replaced with the neutral “Alex Rivera” sample portfolio. Nothing is written until you Save, and saving backs up
          your current file first.
        </p>
      ),
    });
    if (!ok) return;
    const res = await api<{ content: PortfolioContent }>('GET', '/content?template=1');
    if (res.ok) {
      setDraft(res.data.content);
      notify('Template loaded into the draft');
    } else notify('Could not load the template', 'error');
  };

  /* ------------------------------ Context ------------------------------- */

  const ctx: DashboardContextValue | null = useMemo(() => {
    if (!draft) return null;
    return {
      draft,
      update: (path, value) => setDraft((d) => (d ? setAt(d, path, value) : d)),
      replace: (fn) => setDraft((d) => (d ? fn(d) : d)),
      errorAt: (path) => errorsByPath.get(pathKey(path)) ?? [],
      countUnder: (path) => {
        const prefix = pathKey(path);
        return issues.filter((i) => {
          const key = pathKey(i.path);
          return key === prefix || key.startsWith(`${prefix}.`);
        }).length;
      },
      uploads,
      refreshUploads,
      notify,
      confirm,
      setPreview: (hash) => setPreview(hash ? `/${hash}` : '/'),
      focus,
    };
  }, [draft, errorsByPath, issues, uploads, refreshUploads, notify, confirm, focus]);

  const sectionProblems = (roots: string[]) => issues.filter((i) => roots.includes(String(i.path[0] ?? 'schemaVersion'))).length;

  if (status === 'loading') return <FullScreenMessage title="Loading content…" />;
  if (status === 'error' || !ctx) {
    return (
      <FullScreenMessage title="The dashboard can't load">
        <p>{loadError}</p>
        <p className="mt-2">
          It only works under <span className="font-mono">npm run dev</span>, opened at <span className="font-mono">http://localhost:3000/dashboard</span>.
        </p>
      </FullScreenMessage>
    );
  }

  const selectSection = (key: SectionKey) => {
    setSection(key);
    setFocus({});
    const preset = SECTIONS.find((s) => s.key === key)?.preview;
    setPreview(preset ?? '/');
    window.history.replaceState(null, '', `#${key}`);
  };

  return (
    <DashboardContext.Provider value={ctx}>
      <div className="flex h-screen flex-col bg-black text-white select-text" data-testid="dashboard">
        {/* Toolbar */}
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-[#282828] px-4">
          <a href="/" className="text-base font-bold hover:underline">
            Content dashboard
          </a>
          <span className="rounded-full bg-[#ffa42b] px-2 py-0.5 text-[11px] font-bold text-black" title="This page and its API don't exist in production builds">
            DEV ONLY
          </span>
          <span
            role="status"
            data-testid="dashboard-status"
            className={cn('ml-2 text-sm', !valid ? 'text-[#f3727f]' : dirty ? 'text-[#ffa42b]' : 'text-subdued')}
          >
            {!valid ? `${issues.length} problem${issues.length === 1 ? '' : 's'} to fix` : dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => importRef.current?.click()} className="px-2 text-sm text-subdued hover:text-white">
              Import
            </button>
            <button type="button" onClick={exportJson} className="px-2 text-sm text-subdued hover:text-white">
              Export
            </button>
            <button type="button" onClick={resetToTemplate} className="px-2 text-sm text-subdued hover:text-white">
              Reset to template
            </button>
            <button type="button" onClick={() => setShowPreview((v) => !v)} className="px-2 text-sm text-subdued hover:text-white" aria-pressed={showPreview}>
              {showPreview ? 'Hide preview' : 'Show preview'}
            </button>
            <button type="button" onClick={revert} disabled={!dirty} className={cn(spotifyButtonClasses('secondary', 'sm'), 'disabled:opacity-40')}>
              Revert
            </button>
            <button
              type="button"
              onClick={() => save()}
              disabled={!dirty || saving || !valid}
              data-testid="dashboard-save"
              aria-keyshortcuts="Control+S Meta+S"
              className={cn(spotifyButtonClasses(valid ? 'primary' : 'white', 'sm'), 'disabled:opacity-40')}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <input ref={importRef} type="file" hidden accept="application/json,.json" onChange={(e) => importJson(e.target.files?.[0])} />
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Section nav */}
          <nav aria-label="Dashboard sections" className="spotify-scroll w-56 flex-shrink-0 overflow-y-auto border-r border-[#282828] p-3">
            {SECTIONS.map((s) => {
              const count = sectionProblems(s.roots);
              return (
                <React.Fragment key={s.key}>
                  {s.group && <p className="px-3 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a] first:pt-1">{s.group}</p>}
                  <button
                    type="button"
                    onClick={() => selectSection(s.key)}
                    aria-current={section === s.key ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                      section === s.key ? 'bg-[#282828] font-bold text-white' : 'text-subdued hover:bg-[#1a1a1a] hover:text-white'
                    )}
                  >
                    {s.label}
                    {count > 0 && <span className="rounded-full bg-[#f3727f] px-1.5 text-[11px] font-bold text-black">{count}</span>}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Editor */}
          <main className="spotify-scroll min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl p-6 pb-24">
              {section === 'profile' && <ProfileSection />}
              {section === 'site' && <SiteSection />}
              {section === 'home' && <HomeSection />}
              {section === 'playlists' && <PlaylistsSection />}
              {section === 'technologies' && <TechnologiesSection />}
              {section === 'recommenders' && <RecommendersSection />}
              {section === 'ai' && <AiSection />}
              {section === 'coverLetter' && <CoverLetterSection />}
              {section === 'themes' && <ThemesSection />}
              {section === 'extras' && <ExtrasSection />}
              {section === 'resume' && <ResumeSection />}
              {section === 'media' && <MediaSection />}
              {section === 'raw' && <RawJsonSection />}
              {section === 'backups' && <BackupsSection onRestored={load} />}
            </div>
          </main>

          {/* Live preview of the saved site */}
          {showPreview && (
            <aside className="hidden w-[420px] flex-shrink-0 flex-col border-l border-[#282828] lg:flex" aria-label="Preview">
              <div className="flex h-10 items-center justify-between gap-2 border-b border-[#282828] px-3 text-xs text-subdued">
                <span className="truncate">
                  Preview (saved content) · <span className="font-mono">{preview}</span>
                </span>
                <span className="flex gap-3">
                  <button type="button" onClick={() => setPreviewKey((k) => k + 1)} className="hover:text-white">
                    Reload
                  </button>
                  <a href={preview} target="_blank" rel="noreferrer" className="hover:text-white">
                    Open ↗
                  </a>
                </span>
              </div>
              <iframe key={`${preview}-${previewKey}`} src={preview} title="Site preview" className="min-h-0 flex-1 bg-black" />
            </aside>
          )}
        </div>

        {/* Toasts */}
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[300] flex -translate-x-1/2 flex-col items-center gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className={cn('rounded-lg px-4 py-3 text-sm text-white shadow-spotify-elevated animate-toast-in', t.tone === 'error' ? 'bg-[#c42b3c]' : 'bg-toast')}
            >
              {t.message}
            </div>
          ))}
        </div>

        {confirmState && (
          <Dialog title={confirmState.options.title} onClose={() => closeConfirm(false)} width={480} testId="dashboard-confirm">
            <div onKeyDown={(e) => e.key === 'Escape' && closeConfirm(false)}>
              {confirmState.options.body}
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => closeConfirm(false)} className={spotifyButtonClasses('secondary', 'sm')}>
                  Cancel
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => closeConfirm(true)}
                  className={cn(spotifyButtonClasses(confirmState.options.danger ? 'white' : 'primary', 'sm'), confirmState.options.danger && '!bg-[#f3727f]')}
                >
                  {confirmState.options.confirmLabel ?? 'OK'}
                </button>
              </div>
            </div>
          </Dialog>
        )}

        {conflict && (
          <Dialog title="The file changed on disk" onClose={() => setConflict(false)} width={480}>
            <p className="text-sm">
              content/portfolio.json was edited somewhere else (by hand, or in another tab) after you opened the dashboard.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  setConflict(false);
                  await load();
                  notify('Reloaded the file from disk; your unsaved edits were discarded');
                }}
                className={spotifyButtonClasses('secondary', 'sm')}
              >
                Reload from disk
              </button>
              <button type="button" onClick={() => save(true)} className={cn(spotifyButtonClasses('white', 'sm'), '!bg-[#f3727f]')}>
                Overwrite with my draft
              </button>
            </div>
          </Dialog>
        )}
      </div>
    </DashboardContext.Provider>
  );
};

const FullScreenMessage: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="flex h-screen items-center justify-center bg-black p-6 text-center text-white">
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children && <div className="mt-3 text-sm text-subdued">{children}</div>}
    </div>
  </div>
);
