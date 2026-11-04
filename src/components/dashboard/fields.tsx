import React, { useEffect, useId, useRef, useState } from 'react';
import { useDashboard } from './context';
import { Path, getAt, setAt, slugify, uniqueId, renameReferences, RefKind, moveIndex } from './model';
import { uploadFile } from './api';
import { deepTone } from '@/lib/color';
import { ART_KINDS } from '@/content/schema';
import { cn } from '@/lib/utils';
import { ArtGlyph, ChevronLeftIcon, ChevronRightIcon, CloseIcon, PlusIcon } from '@/components/common/Icons';

/* ------------------------------- Shell ---------------------------------- */

export const Field: React.FC<{
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  errors?: string[];
  className?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, hint, errors = [], className, children }) => (
  <div className={cn('min-w-0', className)}>
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold uppercase tracking-wide text-subdued">
      {label}
    </label>
    {children}
    {errors.length > 0 ? (
      <p role="alert" className="mt-1 text-xs text-[#f3727f]">
        {errors.join(' · ')}
      </p>
    ) : (
      hint && <p className="mt-1 text-xs text-[#8a8a8a]">{hint}</p>
    )}
  </div>
);

export const Row: React.FC<{ children: React.ReactNode; cols?: 2 | 3 | 4 }> = ({ children, cols = 2 }) => (
  <div className={cn('grid gap-4', cols === 2 && 'md:grid-cols-2', cols === 3 && 'md:grid-cols-3', cols === 4 && 'md:grid-cols-4')}>
    {children}
  </div>
);

const inputClass = (invalid: boolean) =>
  cn('spotify-input', invalid && '!border-[#f3727f]');

/* ------------------------------ Inputs ---------------------------------- */

interface BaseProps {
  path: Path;
  label: string;
  hint?: React.ReactNode;
  optional?: boolean;
  className?: string;
  placeholder?: string;
}

export const TextField: React.FC<BaseProps & { multiline?: boolean; rows?: number; type?: string }> = ({
  path,
  label,
  hint,
  optional,
  className,
  placeholder,
  multiline,
  rows = 3,
  type = 'text',
}) => {
  const { draft, update, errorAt } = useDashboard();
  const id = useId();
  const value = (getAt(draft, path) as string | undefined) ?? '';
  const errors = errorAt(path);
  const onChange = (v: string) => update(path, optional && v === '' ? undefined : v);
  return (
    <Field label={optional ? `${label} (optional)` : label} htmlFor={id} hint={hint} errors={errors} className={className}>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass(errors.length > 0), 'resize-y leading-relaxed')}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass(errors.length > 0)}
        />
      )}
    </Field>
  );
};

export const UrlField: React.FC<BaseProps> = (props) => (
  <TextField {...props} type="url" placeholder={props.placeholder ?? 'https://'} hint={props.hint ?? 'Full https:// link, or mailto: / tel:'} />
);

export const NumberField: React.FC<BaseProps & { min?: number; max?: number }> = ({ path, label, hint, optional, min, max, className }) => {
  const { draft, update, errorAt } = useDashboard();
  const id = useId();
  const value = getAt(draft, path) as number | undefined;
  const errors = errorAt(path);
  return (
    <Field label={optional ? `${label} (optional)` : label} htmlFor={id} hint={hint} errors={errors} className={className}>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(e) => update(path, e.target.value === '' ? (optional ? undefined : 0) : Number(e.target.value))}
        className={inputClass(errors.length > 0)}
      />
    </Field>
  );
};

export const SelectField: React.FC<BaseProps & { options: { value: string; label: string; group?: string }[] }> = ({
  path,
  label,
  hint,
  optional,
  options,
  className,
}) => {
  const { draft, update, errorAt } = useDashboard();
  const id = useId();
  const value = (getAt(draft, path) as string | undefined) ?? '';
  const errors = errorAt(path);
  const groups = Array.from(new Set(options.map((o) => o.group ?? '')));
  const render = (opts: typeof options) => opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>);
  return (
    <Field label={optional ? `${label} (optional)` : label} htmlFor={id} hint={hint} errors={errors} className={className}>
      <select
        id={id}
        value={value}
        onChange={(e) => update(path, optional && e.target.value === '' ? undefined : e.target.value)}
        className={cn(inputClass(errors.length > 0), 'cursor-pointer')}
      >
        {(optional || !options.some((o) => o.value === value)) && <option value="">{optional ? '— None —' : '— Choose —'}</option>}
        {groups.length > 1
          ? groups.map((g) => (
              <optgroup key={g} label={g}>
                {render(options.filter((o) => (o.group ?? '') === g))}
              </optgroup>
            ))
          : render(options)}
      </select>
    </Field>
  );
};

export const TrackSelect: React.FC<BaseProps> = (props) => {
  const { draft } = useDashboard();
  const options = draft.playlists.flatMap((p) => p.tracks.map((t) => ({ value: t.id, label: t.title, group: p.title })));
  return <SelectField {...props} options={options} />;
};

export const PlaylistSelect: React.FC<BaseProps> = (props) => {
  const { draft } = useDashboard();
  return <SelectField {...props} options={draft.playlists.map((p) => ({ value: p.id, label: p.title }))} />;
};

export const RecommenderSelect: React.FC<BaseProps> = (props) => {
  const { draft } = useDashboard();
  return <SelectField {...props} options={draft.recommenders.map((r) => ({ value: r.id, label: r.name || r.id }))} />;
};

export const ArtKindSelect: React.FC<BaseProps> = (props) => {
  const { draft, update, errorAt } = useDashboard();
  const value = getAt(draft, props.path) as string;
  return (
    <Field label={props.label} errors={errorAt(props.path)} hint={props.hint}>
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={props.label}>
        {ART_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={value === kind}
            aria-label={kind}
            title={kind}
            onClick={() => update(props.path, kind)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded transition-colors',
              value === kind ? 'bg-white text-black' : 'bg-[rgba(255,255,255,0.07)] text-subdued hover:text-white'
            )}
          >
            <ArtGlyph kind={kind} size={18} />
          </button>
        ))}
      </div>
    </Field>
  );
};

export const ColorField: React.FC<BaseProps & { contrastPreview?: boolean }> = ({ path, label, hint, contrastPreview = false, className }) => {
  const { draft, update, errorAt } = useDashboard();
  const id = useId();
  const value = (getAt(draft, path) as string | undefined) ?? '#000000';
  const errors = errorAt(path);
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <Field label={label} htmlFor={id} hint={hint} errors={errors} className={className}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={valid ? value.toLowerCase() : '#000000'}
          onChange={(e) => update(path, e.target.value)}
          className="h-9 w-11 flex-shrink-0 cursor-pointer rounded border border-[#535353] bg-transparent p-0.5"
        />
        <input id={id} value={value} onChange={(e) => update(path, e.target.value)} className={cn(inputClass(errors.length > 0), 'font-mono uppercase')} />
        {contrastPreview && valid && (
          <span
            className="flex-shrink-0 rounded px-2 py-1.5 text-xs font-bold text-white"
            style={{ backgroundColor: deepTone(value, 0.4) }}
            title="How headers and the lyrics canvas will tint this colour"
          >
            Header
          </span>
        )}
      </div>
    </Field>
  );
};

/** Tag-style editor for short string lists (keywords). */
export const TagsField: React.FC<BaseProps> = ({ path, label, hint, placeholder = 'Type and press Enter' }) => {
  const { draft, update, errorAt, countUnder } = useDashboard();
  const id = useId();
  const [text, setText] = useState('');
  const tags = (getAt(draft, path) as string[] | undefined) ?? [];
  const errors = [...errorAt(path), ...(countUnder(path) > errorAt(path).length ? ['One of the entries is invalid'] : [])];
  const add = () => {
    const v = text.trim();
    if (v && !tags.includes(v)) update(path, [...tags, v]);
    setText('');
  };
  return (
    <Field label={label} htmlFor={id} hint={hint} errors={errors}>
      <div className={cn('spotify-input flex min-h-[38px] flex-wrap items-center gap-1.5 !py-1.5', errors.length > 0 && '!border-[#f3727f]')}>
        {tags.map((tag, i) => (
          <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-[#3e3e3e] py-0.5 pl-2.5 pr-1 text-xs">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => update(path, tags.filter((_, j) => j !== i))}
              className="rounded-full p-0.5 text-subdued hover:text-white"
            >
              <CloseIcon size={10} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          placeholder={tags.length ? '' : placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            } else if (e.key === 'Backspace' && !text && tags.length) {
              update(path, tags.slice(0, -1));
            }
          }}
          onBlur={add}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-subdued"
        />
      </div>
    </Field>
  );
};

/** Ordered list of primitive values (paragraphs, ids) with add / remove / reorder. */
export function ArrayField<T>({
  path,
  label,
  hint,
  newValue,
  render,
  addLabel = 'Add',
}: {
  path: Path;
  label: string;
  hint?: React.ReactNode;
  newValue: () => T;
  render: (itemPath: Path, index: number) => React.ReactNode;
  addLabel?: string;
}) {
  const { draft, update, errorAt } = useDashboard();
  const items = (getAt(draft, path) as T[] | undefined) ?? [];
  return (
    <Field label={label} hint={hint} errors={errorAt(path)}>
      <ol className="space-y-2">
        {items.map((_, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-5 flex-shrink-0 pt-2 text-right text-xs tabular-nums text-subdued">{i + 1}</span>
            <div className="min-w-0 flex-1">{render([...path, i], i)}</div>
            <div className="flex flex-shrink-0 pt-1">
              <MiniButton label="Move up" disabled={i === 0} onClick={() => update(path, moveIndex(items, i, i - 1))}>
                <ChevronLeftIcon size={12} className="rotate-90" />
              </MiniButton>
              <MiniButton label="Move down" disabled={i === items.length - 1} onClick={() => update(path, moveIndex(items, i, i + 1))}>
                <ChevronRightIcon size={12} className="rotate-90" />
              </MiniButton>
              <MiniButton label="Remove" onClick={() => update(path, items.filter((__, j) => j !== i))}>
                <CloseIcon size={12} />
              </MiniButton>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => update(path, [...items, newValue()])}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-subdued hover:bg-[rgba(255,255,255,0.07)] hover:text-white"
      >
        <PlusIcon size={12} /> {addLabel}
      </button>
    </Field>
  );
}

/** Bare inputs used inside ArrayField rows. */
export const BareText: React.FC<{ path: Path; multiline?: boolean; placeholder?: string; rows?: number }> = ({ path, multiline, placeholder, rows = 3 }) => {
  const { draft, update, errorAt } = useDashboard();
  const value = (getAt(draft, path) as string | undefined) ?? '';
  const errors = errorAt(path);
  return (
    <>
      {multiline ? (
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => update(path, e.target.value)} className={cn(inputClass(errors.length > 0), 'resize-y leading-relaxed')} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(e) => update(path, e.target.value)} className={inputClass(errors.length > 0)} />
      )}
      {errors.length > 0 && <p className="mt-1 text-xs text-[#f3727f]">{errors.join(' · ')}</p>}
    </>
  );
};

export const MiniButton: React.FC<{ label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; danger?: boolean }> = ({
  label,
  onClick,
  disabled,
  children,
  danger,
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={cn(
      'flex h-7 w-7 items-center justify-center rounded-full text-subdued transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:pointer-events-none disabled:opacity-25',
      danger ? 'hover:text-[#f3727f]' : 'hover:text-white'
    )}
  >
    {children}
  </button>
);

/* ------------------------------ Id field -------------------------------- */

/**
 * Edits an id. Changes apply on blur (not per keystroke) so every reference to the old id
 * can be renamed in one step; ids must be unique among `siblings`.
 */
export const IdField: React.FC<{
  path: Path;
  label?: string;
  refKind?: RefKind;
  titlePath?: Path;
  siblings: string[];
}> = ({ path, label = 'Id', refKind, titlePath, siblings }) => {
  const { draft, replace, errorAt } = useDashboard();
  const inputId = useId();
  const saved = (getAt(draft, path) as string) ?? '';
  const [text, setText] = useState(saved);
  useEffect(() => setText(saved), [saved]);

  const commit = (raw: string) => {
    const next = raw.trim();
    if (next === saved) return;
    replace((d) => {
      const withId = setAt(d, path, next);
      return refKind ? renameReferences(withId, refKind, saved, next) : withId;
    });
  };

  const duplicate = text !== saved && siblings.includes(text);
  const errors = duplicate ? ['Another item already uses this id'] : errorAt(path);
  return (
    <Field
      label={label}
      htmlFor={inputId}
      errors={errors}
      hint={refKind ? 'Used in links. Renaming updates every reference to it.' : 'Lowercase letters, numbers and hyphens'}
    >
      <div className="flex gap-2">
        <input
          id={inputId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => !duplicate && commit(text)}
          onKeyDown={(e) => e.key === 'Enter' && !duplicate && commit(text)}
          className={cn(inputClass(errors.length > 0), 'font-mono')}
        />
        {titlePath && (
          <button
            type="button"
            onClick={() => {
              const next = uniqueId(slugify(String(getAt(draft, titlePath) ?? '')), siblings.filter((s) => s !== saved));
              setText(next);
              commit(next);
            }}
            className="flex-shrink-0 whitespace-nowrap rounded-full border border-[#535353] px-3 text-xs font-bold text-subdued hover:border-white hover:text-white"
          >
            From title
          </button>
        )}
      </div>
    </Field>
  );
};

/* ----------------------------- Image field ------------------------------ */

export const UploadField: React.FC<BaseProps & { kind?: 'image' | 'pdf' }> = ({ path, label, hint, optional = true, kind = 'image' }) => {
  const { draft, update, errorAt, uploads, refreshUploads, notify } = useDashboard();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const value = getAt(draft, path) as string | undefined;
  const choices = uploads.filter((u) => (kind === 'pdf' ? u.name.endsWith('.pdf') : !u.name.endsWith('.pdf')));

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    const res = await uploadFile(file, kind);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
    if (!res.ok || !res.path) {
      notify(res.error ?? 'Upload failed', 'error');
      return;
    }
    update(path, res.path);
    await refreshUploads();
    notify(`Uploaded ${file.name}`);
  };

  return (
    <Field label={optional ? `${label} (optional)` : label} hint={hint ?? (kind === 'pdf' ? 'PDF, up to 10 MB' : 'PNG, JPEG, WebP or AVIF, up to 5 MB')} errors={errorAt(path)}>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-[#282828] text-[10px] text-subdued">
          {value && kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element -- dev-only preview of an uploaded file
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : value ? (
            'PDF'
          ) : (
            'None'
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate font-mono text-xs text-subdued">{value ?? 'Generated artwork is used'}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black hover:scale-104 disabled:opacity-50"
            >
              {busy ? 'Uploading…' : 'Upload'}
            </button>
            {choices.length > 0 && (
              <select
                aria-label={`Choose an existing file for ${label}`}
                value=""
                onChange={(e) => e.target.value && update(path, e.target.value)}
                className="rounded-full border border-[#535353] bg-transparent px-2 py-1 text-xs text-subdued"
              >
                <option value="">Choose existing…</option>
                {choices.map((u) => (
                  <option key={u.path} value={u.path}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
            {value && optional && (
              <button type="button" onClick={() => update(path, undefined)} className="rounded-full px-2 py-1 text-xs font-bold text-subdued hover:text-white">
                Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept={kind === 'pdf' ? 'application/pdf' : 'image/png,image/jpeg,image/webp,image/avif'}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    </Field>
  );
};

/* ------------------------------- Layout --------------------------------- */

export const Section: React.FC<{ title: string; description?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode }> = ({
  title,
  description,
  children,
  actions,
}) => (
  <section className="space-y-5">
    <header className="flex items-end justify-between gap-4 border-b border-[rgba(255,255,255,0.1)] pb-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-subdued">{description}</p>}
      </div>
      {actions}
    </header>
    {children}
  </section>
);

export const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn('space-y-4 rounded-lg bg-[rgba(255,255,255,0.04)] p-5', className)}>
    {title && <h3 className="text-base font-bold">{title}</h3>}
    {children}
  </div>
);

export const CheckboxField: React.FC<{ path: Path; label: string; hint?: React.ReactNode }> = ({ path, label, hint }) => {
  const { draft, update } = useDashboard();
  const checked = getAt(draft, path) === true;
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => update(path, e.target.checked ? true : undefined)}
        className="mt-0.5 h-4 w-4 accent-[var(--accent-primary)]"
      />
      <span>
        {label}
        {hint && <span className="block text-xs text-[#8a8a8a]">{hint}</span>}
      </span>
    </label>
  );
};
