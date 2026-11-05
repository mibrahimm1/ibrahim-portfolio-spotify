import React from 'react';
import { allPlaylists, candidateProfile, recommenders, resumeConfig } from '@/data/portfolioData';
import type { Track } from '@/types/portfolio';

/**
 * What Ctrl+P prints: the same content as a compact, ATS-friendly one-page résumé, driven
 * by `resume.sections` exactly like the old /resume page. Hidden on screen (data-print-only).
 */

/** "https://github.com/octocat" → "octocat" (last non-empty path segment). */
export function handleFromUrl(url: string) {
  try {
    return new URL(url).pathname.split('/').filter(Boolean).pop() ?? url;
  } catch {
    return url;
  }
}

export function doiFromUrl(url: string) {
  const match = url.match(/^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i);
  return match ? match[1] : null;
}

const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="mb-1.5 mt-4 border-b border-black/30 pb-0.5 text-[10px] font-bold uppercase tracking-[0.16em]">{children}</h2>
);

const Item: React.FC<{ track: Track; variant: string }> = ({ track, variant }) => {
  if (variant === 'publication') {
    const doi = track.externalUrl ? doiFromUrl(track.externalUrl) : null;
    return (
      <div className="text-[10.5px]">
        <p className="font-bold">{track.title}</p>
        <p>
          {track.subtitle} · {track.album} ({track.dateAdded}){doi && ` · DOI: ${doi}`}
        </p>
      </div>
    );
  }
  return (
    <div className="break-inside-avoid text-[10.5px] leading-snug">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-bold">
          {track.title}
          {variant !== 'projects' && <span className="font-normal"> | {track.subtitle}</span>}
        </p>
        <span className="shrink-0">{variant === 'education' ? track.duration : track.dateAdded}</span>
      </div>
      {variant !== 'education' && <p className="font-semibold">{track.hook}</p>}
      <p>{track.details}</p>
    </div>
  );
};

export const PrintResume: React.FC = () => (
  <div data-print-only className="text-black">
    <h1 className="text-[22px] font-bold leading-tight">{candidateProfile.name}</h1>
    <p className="text-[12px] font-semibold">{candidateProfile.role}</p>
    <p className="mt-1 text-[10px]">
      {[resumeConfig.locationLine, candidateProfile.phoneDisplay, candidateProfile.email, `GitHub: ${handleFromUrl(candidateProfile.github)}`, `LinkedIn: ${handleFromUrl(candidateProfile.linkedin)}`].join('  •  ')}
    </p>

    <Heading>Summary</Heading>
    <p className="text-[10.5px] leading-snug">{candidateProfile.bio}</p>

    {resumeConfig.skills.length > 0 && (
      <>
        <Heading>Technical skills</Heading>
        <div className="grid grid-cols-2 gap-x-4 text-[10.5px]">
          {resumeConfig.skills.map((s) => (
            <p key={s.label}>
              <span className="font-bold">{s.label}:</span> {s.value}
            </p>
          ))}
        </div>
      </>
    )}

    {resumeConfig.sections.map((section) => {
      const tracks = (allPlaylists.find((p) => p.id === section.playlistId)?.tracks ?? []).slice(0, section.limit);
      if (tracks.length === 0) return null;
      return (
        <section key={section.heading}>
          <Heading>{section.heading}</Heading>
          {section.variant === 'bullets' ? (
            <ul className="list-inside list-disc text-[10.5px]">
              {tracks.map((t) => (
                <li key={t.id}>
                  <span className="font-bold">{t.title}</span> — {t.subtitle} ({t.dateAdded})
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-1.5">
              {tracks.map((t) => (
                <Item key={t.id} track={t} variant={section.variant} />
              ))}
            </div>
          )}
        </section>
      );
    })}

    {recommenders.length > 0 && (
      <>
        <Heading>{resumeConfig.recommendationsHeading}</Heading>
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          {recommenders.map((r) => (
            <p key={r.id}>
              <span className="font-bold">{r.name}</span>, {r.title}, {r.affiliation}. {r.ranking}
            </p>
          ))}
        </div>
      </>
    )}
  </div>
);
