import React from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile } from '@/data/portfolioData';
import { copyToClipboard, downloadResume } from '@/lib/menus';
import { spotifyButtonClasses } from '@/components/common/SpotifyButton';
import { ArtGlyph, ChevronRightIcon, DownloadIcon, ExternalLinkIcon, MailIcon } from '@/components/common/Icons';
import { cn } from '@/lib/utils';

/**
 * The fourth tab on phones, in the slot Spotify uses for Premium: a single call-to-action
 * page with ways to reach the candidate, send the Recruiter Mix, and get the resume.
 */
export const ContactView: React.FC = () => {
  const setBookingModalOpen = usePortfolioStore((s) => s.setBookingModalOpen);
  const navigateToRecruiterMix = usePortfolioStore((s) => s.navigateToRecruiterMix);
  const mixCount = usePortfolioStore((s) => s.recruiterMix.length);

  const rows: { label: string; detail: string; href?: string; onClick?: () => void; external?: boolean; icon: React.ReactNode }[] = [
    {
      label: 'Email',
      detail: candidateProfile.email,
      href: `mailto:${candidateProfile.email}`,
      onClick: () => void copyToClipboard(candidateProfile.email, 'Email copied to clipboard'),
      icon: <MailIcon size={20} />,
    },
    { label: 'Phone', detail: candidateProfile.phoneDisplay, href: `tel:${candidateProfile.phone.replace(/\s/g, '')}`, icon: <ArtGlyph kind="mic" size={20} /> },
    { label: 'GitHub', detail: candidateProfile.github.replace(/^https?:\/\/(www\.)?/, ''), href: candidateProfile.github, external: true, icon: <ArtGlyph kind="code" size={20} /> },
    { label: 'LinkedIn', detail: candidateProfile.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: candidateProfile.linkedin, external: true, icon: <ArtGlyph kind="people" size={20} /> },
    { label: 'Location', detail: candidateProfile.locationChip, icon: <ArtGlyph kind="work" size={20} /> },
  ];

  return (
    <div className="px-4 pb-8 pt-[max(16px,env(safe-area-inset-top))]" data-testid="contact-view">
      <h1 className="pb-4 text-2xl font-bold tracking-tight">Contact</h1>

      <section
        className="overflow-hidden rounded-lg p-5"
        style={{ backgroundColor: 'var(--banner-color)', backgroundImage: 'linear-gradient(135deg, transparent, rgba(0,0,0,0.5))' }}
      >
        <p className="text-sm font-bold text-[rgba(255,255,255,0.85)]">{candidateProfile.availabilityLine}</p>
        <h2 className="mt-1 text-[28px] font-bold leading-tight tracking-tight">Let&apos;s talk about your team</h2>
        <p className="mt-2 text-sm text-[rgba(255,255,255,0.85)]">
          {candidateProfile.name} · {candidateProfile.role}
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <a href={candidateProfile.calendarBookingUrl} target="_blank" rel="noopener noreferrer" className={cn(spotifyButtonClasses('primary', 'lg'), 'w-full')}>
            Book a call
          </a>
          <button type="button" onClick={() => setBookingModalOpen(true)} className={cn(spotifyButtonClasses('white', 'lg'), 'w-full')} data-testid="m-send-mix">
            Send your Recruiter Mix
          </button>
        </div>
        <button type="button" onClick={navigateToRecruiterMix} className="mt-3 text-sm font-bold text-[rgba(255,255,255,0.85)] underline-offset-2 active:underline">
          {mixCount === 0 ? 'Your mix is empty: save projects with +' : `${mixCount} ${mixCount === 1 ? 'item' : 'items'} in your mix`}
        </button>
      </section>

      <ul className="mt-6">
        {rows.map((row) => {
          const content = (
            <>
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-[rgba(255,255,255,0.1)]">{row.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base">{row.label}</span>
                <span className="block truncate text-sm text-subdued">{row.detail}</span>
              </span>
              {row.external ? <ExternalLinkIcon size={16} className="text-subdued" /> : row.href && <ChevronRightIcon size={14} className="text-subdued" />}
            </>
          );
          return (
            <li key={row.label}>
              {row.href ? (
                <a
                  href={row.href}
                  onClick={row.onClick}
                  target={row.external ? '_blank' : undefined}
                  rel={row.external ? 'noopener noreferrer' : undefined}
                  className="flex h-[72px] items-center gap-3 active:opacity-70"
                >
                  {content}
                </a>
              ) : (
                <div className="flex h-[72px] items-center gap-3">{content}</div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-col gap-3 border-t border-[rgba(255,255,255,0.1)] pt-6">
        <button type="button" onClick={downloadResume} className={cn(spotifyButtonClasses('secondary', 'lg'), 'w-full')}>
          <DownloadIcon size={18} /> Download resume (PDF)
        </button>
        <a href="/resume" className={cn(spotifyButtonClasses('secondary', 'lg'), 'w-full')}>
          Open the standard resume
        </a>
      </div>
    </div>
  );
};
