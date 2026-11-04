'use client';

import React from 'react';
import Link from 'next/link';
import { allPlaylists, candidateProfile, recommenders, resumeConfig } from '@/data/portfolioData';
import { downloadResume } from '@/lib/menus';
import { Track } from '@/types/portfolio';

/** "https://github.com/octocat" → "octocat" (last non-empty path segment). */
function handleFromUrl(url: string) {
  try {
    return new URL(url).pathname.split('/').filter(Boolean).pop() ?? url;
  } catch {
    return url;
  }
}

function doiFromUrl(url: string) {
  const match = url.match(/^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i);
  return match ? match[1] : null;
}

const SectionHeading: React.FC<{ children: React.ReactNode; tight?: boolean }> = ({ children, tight }) => (
  <h2 className={`text-xs uppercase font-bold tracking-widest text-gray-500 ${tight ? 'mb-2' : 'mb-3'} border-b border-gray-200 pb-1`}>
    {children}
  </h2>
);

const ExperienceItem: React.FC<{ track: Track }> = ({ track }) => (
  <div>
    <div className="flex justify-between items-baseline">
      <h3 className="text-sm font-bold text-gray-900">
        {track.title} <span className="text-gray-600 font-normal">| {track.subtitle}</span>
      </h3>
      <span className="text-xs font-semibold text-gray-500">{track.dateAdded}</span>
    </div>
    <p className="text-xs font-semibold text-blue-700 mt-0.5">Key Metric: {track.hook}</p>
    <p className="text-xs text-gray-700 leading-relaxed mt-1">{track.details}</p>
  </div>
);

const ProjectItem: React.FC<{ track: Track }> = ({ track }) => (
  <div>
    <div className="flex justify-between items-baseline">
      <h3 className="text-sm font-bold text-gray-900">
        {track.title}
        {track.externalUrl && (
          <a
            href={track.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-xs ml-2 hover:underline"
          >
            [{track.externalUrl.includes('github.com') ? 'GitHub' : 'Link'} ↗]
          </a>
        )}
      </h3>
      <span className="text-xs text-gray-500">{track.dateAdded}</span>
    </div>
    <p className="text-xs font-semibold text-green-700 mt-0.5">{track.hook}</p>
    <p className="text-xs text-gray-700 leading-relaxed mt-1">{track.details}</p>
  </div>
);

const EducationItem: React.FC<{ track: Track }> = ({ track }) => (
  <div>
    <div className="flex justify-between items-baseline">
      <h3 className="text-sm font-bold text-gray-900">
        {track.title} <span className="text-gray-600 font-normal">| {track.subtitle}</span>
      </h3>
      <span className="text-xs font-bold text-gray-800">{track.duration}</span>
    </div>
    <p className="text-xs text-gray-700 leading-relaxed mt-0.5">{track.details}</p>
    {track.credits.length > 0 && (
      <p className="text-[11px] text-gray-500 mt-0.5">
        <span className="font-semibold text-gray-700">Relevant Coursework: </span>
        {track.credits.map((c) => `${c.item} (${c.role})`).join(', ')}
      </p>
    )}
  </div>
);

const PublicationItem: React.FC<{ track: Track }> = ({ track }) => {
  const doi = track.externalUrl ? doiFromUrl(track.externalUrl) : null;
  return (
    <div className="text-xs text-gray-800">
      <p className="font-bold text-gray-900">{track.title}</p>
      <p className="text-gray-600">
        {track.subtitle} • {track.album} ({track.dateAdded})
      </p>
      {track.externalUrl && (
        <a href={track.externalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {doi ? `DOI: ${doi}` : 'Read the paper'} ↗
        </a>
      )}
    </div>
  );
};

export default function StandardResumePage() {
  const contact = [
    <span key="loc">📍 {resumeConfig.locationLine}</span>,
    <a key="tel" href={`tel:${candidateProfile.phone.replace(/\s/g, '')}`} className="hover:underline">
      📞 {candidateProfile.phoneDisplay}
    </a>,
    <a key="mail" href={`mailto:${candidateProfile.email}`} className="text-blue-600 hover:underline">
      ✉ {candidateProfile.email}
    </a>,
    <a key="gh" href={candidateProfile.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      GitHub: {handleFromUrl(candidateProfile.github)}
    </a>,
    <a key="li" href={candidateProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      LinkedIn: {handleFromUrl(candidateProfile.linkedin)}
    </a>,
  ];

  return (
    <div
      data-testid="standard-resume-container"
      className="h-screen overflow-y-auto bg-[#f8f9fa] text-[#1a1a1a] font-sans antialiased select-text selection:bg-[#1ed760] selection:text-black print:h-auto print:overflow-visible"
    >
      {/* Sticky Action Bar (Hidden in Print) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-3.5 shadow-sm flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121212] text-white text-xs font-bold hover:bg-[#1ed760] hover:text-[#121212] transition-all shadow-sm"
          >
            <span>♫</span>
            <span>Return to Spotify Experience</span>
          </Link>
          <span className="text-xs text-gray-500 hidden sm:inline">Standard Recruiter Resume View</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Print Page
          </button>
          <button
            onClick={downloadResume}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            Download PDF Resume
          </button>
          <a
            href={candidateProfile.calendarBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1ab752] text-black text-xs font-bold transition-all shadow-sm"
          >
            Book Call ↗
          </a>
        </div>
      </header>

      {/* Main Resume Canvas (Standard Letter / A4 Proportions) */}
      <main className="max-w-4xl mx-auto my-8 p-8 md:p-14 bg-white border border-gray-200 shadow-lg rounded-sm print:shadow-none print:border-none print:m-0 print:p-0">
        <section className="border-b border-gray-300 pb-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{candidateProfile.name}</h1>
          <p className="text-base md:text-lg font-semibold text-blue-700 mt-1">{candidateProfile.role}</p>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-gray-600 mt-3">
            {contact.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>•</span>}
                {item}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <SectionHeading tight>Executive Summary</SectionHeading>
          <p className="text-xs leading-relaxed text-gray-700">{candidateProfile.bio}</p>
        </section>

        {resumeConfig.skills.length > 0 && (
          <section className="mb-6">
            <SectionHeading tight>Technical Skills</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-800">
              {resumeConfig.skills.map((skill) => (
                <div key={skill.label}>
                  <span className="font-bold">{skill.label}:</span> {skill.value}
                </div>
              ))}
            </div>
          </section>
        )}

        {resumeConfig.sections.map((section) => {
          const tracks = (allPlaylists.find((p) => p.id === section.playlistId)?.tracks ?? []).slice(0, section.limit);
          if (tracks.length === 0) return null;
          return (
            <section key={section.heading} className="mb-6">
              <SectionHeading tight={section.variant === 'publication' || section.variant === 'bullets'}>
                {section.heading}
              </SectionHeading>
              {section.variant === 'bullets' ? (
                <ul className="list-disc list-inside text-xs text-gray-800 space-y-1">
                  {tracks.map((t) => (
                    <li key={t.id}>
                      <span className="font-bold">{t.title}</span> — {t.subtitle} ({t.dateAdded})
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={section.variant === 'education' ? 'space-y-3' : section.variant === 'publication' ? 'space-y-2' : 'space-y-4'}>
                  {tracks.map((t) =>
                    section.variant === 'experience' ? (
                      <ExperienceItem key={t.id} track={t} />
                    ) : section.variant === 'projects' ? (
                      <ProjectItem key={t.id} track={t} />
                    ) : section.variant === 'education' ? (
                      <EducationItem key={t.id} track={t} />
                    ) : (
                      <PublicationItem key={t.id} track={t} />
                    )
                  )}
                </div>
              )}
            </section>
          );
        })}

        {recommenders.length > 0 && (
          <section>
            <SectionHeading tight>{resumeConfig.recommendationsHeading}</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {recommenders.map((rec) => (
                <div key={rec.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="font-bold text-gray-900">{rec.name}</p>
                  <p className="text-gray-600 text-[11px]">{rec.title}</p>
                  <p className="text-gray-600 text-[11px]">{rec.affiliation}</p>
                  <p className="text-blue-700 font-semibold mt-1">★ {rec.ranking}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
