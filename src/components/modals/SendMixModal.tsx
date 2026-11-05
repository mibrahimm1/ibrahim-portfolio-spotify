import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { candidateProfile } from '@/data/portfolioData';
import { resolvePlaylist, RECRUITER_MIX_ID } from '@/lib/catalog';
import { CoverArt } from '@/components/common/CoverArt';
import { spotifyButtonClasses } from '@/components/common/SpotifyButton';
import { cn } from '@/lib/utils';
import { Dialog } from './Dialog';

function buildMessage(lines: string[]) {
  const itemsList = lines.length > 0 ? lines.join('\n') : 'All engineering systems & production background';
  return `Hi ${candidateProfile.firstName},\n\nI reviewed your portfolio and curated my Recruiter Mix with the following priorities:\n\n${itemsList}\n\nI'd like to schedule an introductory call to discuss opportunities on our team.`;
}

/** Floating-label field matching Spotify's "Edit details" inputs. */
const Field: React.FC<{ label: string; children: React.ReactNode; id: string; className?: string }> = ({
  label,
  children,
  id,
  className,
}) => (
  <div className={cn('group relative', className)}>
    <label
      htmlFor={id}
      className="pointer-events-none absolute -top-2 left-2.5 rounded bg-menu px-1 text-[11px] font-bold text-white opacity-0 transition-opacity group-focus-within:opacity-100"
    >
      {label}
    </label>
    {children}
  </div>
);

export const SendMixModal: React.FC = () => {
  const { isBookingModalOpen, recruiterMix } = usePortfolioStore(
    useShallow((s) => ({ isBookingModalOpen: s.isBookingModalOpen, recruiterMix: s.recruiterMix }))
  );
  const setBookingModalOpen = usePortfolioStore((s) => s.setBookingModalOpen);
  const showToast = usePortfolioStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const bookmarkedTracks = resolvePlaylist(RECRUITER_MIX_ID, recruiterMix).tracks;

  // Pre-fill the message each time the dialog opens (not on every render, so edits survive).
  useEffect(() => {
    if (!isBookingModalOpen) return;
    const tracks = resolvePlaylist(RECRUITER_MIX_ID, usePortfolioStore.getState().recruiterMix).tracks;
    setMessage(buildMessage(tracks.map((t, idx) => `${idx + 1}. ${t.title} — ${t.subtitle} (${t.album})`)));
  }, [isBookingModalOpen]);

  if (!isBookingModalOpen) return null;

  const close = () => setBookingModalOpen(false);

  const handleOpenGoogleCalendar = () => {
    window.open(candidateProfile.calendarBookingUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitAndBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const payload = {
      recruiterName: name || 'Technical Recruiter',
      recruiterEmail: email,
      company: company || 'Engineering Team',
      notes: message,
      bookmarkedItems: bookmarkedTracks.map((t) => ({ id: t.id, title: t.title, category: t.album })),
      timestamp: new Date().toISOString(),
    };

    // 1. Open the booking page synchronously, inside the click, so popup blockers allow it.
    handleOpenGoogleCalendar();

    // 2. Hand the message to the visitor's mail client; this is what actually reaches the portfolio owner.
    const subject = encodeURIComponent(`[Portfolio Inquiry] ${company ? `${company} - ` : ''}${name || 'Recruiter Mix'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name || 'Recruiter'}${company ? `, ${company}` : ''} (${email})`);
    window.location.href = `mailto:${candidateProfile.email}?subject=${subject}&body=${body}`;

    // 3. Log to the API route without blocking the UI (keepalive survives navigation).
    fetch('/api/send-mix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});

    showToast('Your mail app and the booking page are open');
    close();
  };

  return (
    <Dialog title="Send your Recruiter Mix" onClose={close} testId="send-mix-modal">
      <form onSubmit={handleSubmitAndBook}>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex w-full flex-shrink-0 flex-row items-end gap-3 sm:w-[180px] sm:flex-col sm:items-stretch">
            <CoverArt color="#450af5" kind="heart" isRecruiterMix size={180} shadow className="max-sm:!h-24 max-sm:!w-24" />
            <button
              type="button"
              onClick={handleOpenGoogleCalendar}
              className={cn(spotifyButtonClasses('primary', 'sm'), 'w-full')}
            >
              Schedule on Meet
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Field label="Name" id="mix-name">
              <input
                id="mix-name"
                data-autofocus
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="spotify-input"
              />
            </Field>
            <div className="flex gap-2">
              <Field label="Work email" id="mix-email" className="min-w-0 flex-[3]">
                <input
                  id="mix-email"
                  type="email"
                  required
                  placeholder="Work email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="spotify-input"
                />
              </Field>
              <Field label="Company" id="mix-company" className="min-w-0 flex-[2]">
                <input
                  id="mix-company"
                  type="text"
                  placeholder="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="spotify-input"
                />
              </Field>
            </div>
            <Field label="Message" id="mix-message">
              <textarea
                id="mix-message"
                data-testid="mix-summary-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="spotify-input h-[132px] resize-none"
              />
            </Field>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm text-subdued">
            {bookmarkedTracks.length} {bookmarkedTracks.length === 1 ? 'item' : 'items'} in your mix
          </span>
          <button
            type="submit"
            disabled={!email}
            className={cn(spotifyButtonClasses('white', 'lg'), 'disabled:hover:scale-100')}
          >
            Send &amp; book call
          </button>
        </div>
        <p className="mt-4 text-[11px] font-bold leading-snug text-white">
          Sending opens your email app with this message addressed to {candidateProfile.firstName}, and opens the
          booking page in a new tab.
        </p>
      </form>
    </Dialog>
  );
};
