'use client';

import React, { useEffect, useState } from 'react';
import { Download, Menu, X, ArrowUpRight } from 'lucide-react';
import { useScrollProgress, useScrolledPast } from './motion/Animated';
import { appLinks, profile } from './shared';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#experience', label: 'Experience' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

/**
 * Full-width header that condenses into a floating pill once you scroll past the hero's
 * top. A 2px progress line runs along the top edge. On phones the links move into a
 * full-screen menu whose items slide in one after another.
 */
export const LandingNav: React.FC = () => {
  const condensed = useScrolledPast(120);
  const progress = useScrollProgress<HTMLDivElement>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div
        ref={progress}
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-landing-accent"
        style={{ transform: 'scaleX(var(--progress, 0))' }}
      />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
        <nav
          aria-label="Main"
          className={cn(
            'pointer-events-auto flex w-full items-center justify-between gap-4 rounded-full transition-[max-width,background-color,box-shadow,padding] duration-500 ease-out-soft',
            condensed
              ? 'max-w-[720px] bg-[color-mix(in_oklab,var(--l-card)_82%,transparent)] px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-landing-line backdrop-blur-md'
              : 'max-w-[1120px] bg-transparent px-2 py-3 md:px-5'
          )}
        >
          <a href="#top" className="flex items-center gap-2.5 pl-1 text-[15px] font-semibold tracking-tight" data-testid="landing-home">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-landing-ink text-[11px] font-bold text-landing-bg">
              {profile.initials}
            </span>
            <span className={cn('whitespace-nowrap', condensed && 'sr-only')}>{profile.name}</span>
          </a>

          <ul className="hidden items-center gap-6 whitespace-nowrap text-sm md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="landing-link py-1 text-landing-muted transition-colors hover:text-landing-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={appLinks.home}
              className="hidden items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm text-landing-muted transition-colors hover:text-landing-ink lg:inline-flex"
              data-testid="landing-open-app"
            >
              Interactive version <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a
              href={profile.resumePdf}
              download={profile.resumeFileName}
              className="landing-fill hidden items-center gap-1.5 rounded-full bg-landing-ink px-4 py-2 text-sm font-medium text-landing-bg [--fill:var(--l-accent)] sm:inline-flex"
              data-testid="landing-download"
            >
              <Download size={14} aria-hidden="true" /> Résumé
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-landing-ink text-landing-bg md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="landing-menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </nav>
      </header>

      {/* Phone menu */}
      <div
        id="landing-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className={cn('fixed inset-0 z-[70] flex-col bg-landing-surface px-6 pb-10 pt-5 text-landing-on-surface md:hidden', open ? 'flex' : 'hidden')}
      >
        <div className="flex justify-end">
          <button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <ul className="mt-10 space-y-2">
          {[...LINKS, { href: appLinks.home, label: 'Interactive version' }].map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn('block text-[40px] font-medium leading-tight tracking-[-0.03em]', open && 'landing-rise')}
                style={{ ['--d' as string]: `${80 + i * 60}ms` }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={profile.resumePdf} download={profile.resumeFileName} className="mt-auto inline-flex items-center gap-2 text-sm text-white/70">
          <Download size={14} aria-hidden="true" /> Download résumé (PDF)
        </a>
      </div>
    </>
  );
};
