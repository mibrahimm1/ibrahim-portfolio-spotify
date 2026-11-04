'use client';

import React from 'react';
import Link from 'next/link';
import {
  candidateProfile,
  workExperienceTracks,
  featuredProjectsTracks,
  educationTracks,
  publicationTracks,
  certificationsTracks,
  recommenders,
} from '@/data/portfolioData';

export default function StandardResumePage() {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Muhammad_Ibrahim_Shaikh_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <span className="text-xs text-gray-500 hidden sm:inline">
            Standard Recruiter Resume View
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Print Page
          </button>
          <button
            onClick={handleDownload}
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
        {/* Header Block */}
        <section className="border-b border-gray-300 pb-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {candidateProfile.name}
          </h1>
          <p className="text-base md:text-lg font-semibold text-blue-700 mt-1">
            {candidateProfile.role}
          </p>

          {/* Contact Line */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-gray-600 mt-3">
            <span>📍 Islamabad & Karachi, Pakistan (Open to Remote)</span>
            <span>•</span>
            <a href={`tel:${candidateProfile.phone}`} className="hover:underline">
              📞 {candidateProfile.phoneDisplay}
            </a>
            <span>•</span>
            <a href={`mailto:${candidateProfile.email}`} className="text-blue-600 hover:underline">
              ✉ {candidateProfile.email}
            </a>
            <span>•</span>
            <a
              href={candidateProfile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub: mibrahimm1
            </a>
            <span>•</span>
            <a
              href={candidateProfile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              LinkedIn: ibrahimshaikhh
            </a>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="mb-6">
          <h2 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2 border-b border-gray-200 pb-1">
            Executive Summary
          </h2>
          <p className="text-xs leading-relaxed text-gray-700">
            {candidateProfile.bio}
          </p>
        </section>

        {/* Core Technical Competencies */}
        <section className="mb-6">
          <h2 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2 border-b border-gray-200 pb-1">
            Technical Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-800">
            <div>
              <span className="font-bold">Languages & Core:</span> Python, TypeScript, JavaScript, SQL, C++, Bash
            </div>
            <div>
              <span className="font-bold">AI & Agentic Frameworks:</span> LangChain, LangGraph, PyTorch, YOLOv8/v11, SAM 2, Hugging Face
            </div>
            <div>
              <span className="font-bold">Data & RAG Systems:</span> FAISS, ChromaDB, Supabase Vector, BGE Embeddings, PostgreSQL
            </div>
            <div>
              <span className="font-bold">Infrastructure & Tools:</span> FastAPI, Next.js, Docker, AWS (EC2/S3), n8n, WebRTC, Git
            </div>
          </div>
        </section>

        {/* Work Experience */}
        <section className="mb-6">
          <h2 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-3 border-b border-gray-200 pb-1">
            Professional Experience
          </h2>

          <div className="space-y-4">
            {workExperienceTracks.map((role) => (
              <div key={role.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-gray-900">
                    {role.title} <span className="text-gray-600 font-normal">| {role.subtitle}</span>
                  </h3>
                  <span className="text-xs font-semibold text-gray-500">{role.dateAdded}</span>
                </div>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">
                  Key Metric: {role.hook}
                </p>
                <p className="text-xs text-gray-700 leading-relaxed mt-1">
                  {role.details}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Production Projects */}
        <section className="mb-6">
          <h2 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-3 border-b border-gray-200 pb-1">
            Featured Systems & AI Projects
          </h2>

          <div className="space-y-4">
            {featuredProjectsTracks.slice(0, 5).map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-gray-900">
                    {project.title}
                    {project.externalUrl && (
                      <a
                        href={project.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs ml-2 hover:underline"
                      >
                        [GitHub ↗]
                      </a>
                    )}
                  </h3>
                  <span className="text-xs text-gray-500">{project.dateAdded}</span>
                </div>
                <p className="text-xs font-semibold text-green-700 mt-0.5">
                  {project.hook}
                </p>
                <p className="text-xs text-gray-700 leading-relaxed mt-1">
                  {project.details}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Education & Academic Honors */}
        <section className="mb-6">
          <h2 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-3 border-b border-gray-200 pb-1">
            Education
          </h2>

          <div className="space-y-3">
            {educationTracks.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-gray-900">
                    {edu.title} <span className="text-gray-600 font-normal">| {edu.subtitle}</span>
                  </h3>
                  <span className="text-xs font-bold text-gray-800">{edu.duration}</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mt-0.5">
                  {edu.details}
                </p>
                {edu.credits && (
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    <span className="font-semibold text-gray-700">Relevant Coursework: </span>
                    {edu.credits.map((c) => `${c.item} (${c.role})`).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Peer-Reviewed Publications */}
        <section className="mb-6">
          <h2 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2 border-b border-gray-200 pb-1">
            Peer-Reviewed Publications
          </h2>
          {publicationTracks.map((pub) => (
            <div key={pub.id} className="text-xs text-gray-800">
              <p className="font-bold text-gray-900">{pub.title}</p>
              <p className="text-gray-600">{pub.subtitle} • {pub.album} ({pub.dateAdded})</p>
              {pub.externalUrl && (
                <a
                  href={pub.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  DOI: 10.22214/ijraset.2025.66898 ↗
                </a>
              )}
            </div>
          ))}
        </section>

        {/* Honors, Awards & Certifications */}
        <section className="mb-6">
          <h2 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2 border-b border-gray-200 pb-1">
            Honors, Awards & Certifications
          </h2>
          <ul className="list-disc list-inside text-xs text-gray-800 space-y-1">
            {certificationsTracks.map((cert) => (
              <li key={cert.id}>
                <span className="font-bold">{cert.title}</span> — {cert.subtitle} ({cert.dateAdded})
              </li>
            ))}
          </ul>
        </section>

        {/* Faculty Endorsements Summary */}
        <section>
          <h2 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-2 border-b border-gray-200 pb-1">
            Academic Faculty Recommendations
          </h2>
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
      </main>
    </div>
  );
}
