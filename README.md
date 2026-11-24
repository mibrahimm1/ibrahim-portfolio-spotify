# Muhammad Ibrahim Shaikh — Spotify-Style Developer Portfolio 🎵💻

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-172%20Unit%20%7C%2065%20E2E%20Passed-brightgreen?style=flat)](tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> An authentic, 1:1 Spotify Desktop & Mobile-inspired developer portfolio designed to showcase production AI architectures, multi-agent LLM systems, computer vision pipelines, and full-stack engineering. Built with static export lockdown, zero runtime server overhead, strict CSP, and a visual dev CMS.

---

## 👨‍💻 About Me

I am **Muhammad Ibrahim Shaikh**, an **AI & Product Engineer** studying Software Engineering at **NUST** (Class of '27, 3.59 CGPA, 100% Scholarship). I build autonomous agentic workflows, computer vision models, and production RAG pipelines that hold up in production environments.

* 📍 **Locations:** Islamabad & Karachi, Pakistan · *Open to Remote Roles Worldwide*
* 💼 **LinkedIn:** [linkedin.com/in/ibrahimshaikhh](https://www.linkedin.com/in/ibrahimshaikhh/)
* 🐙 **GitHub:** [github.com/mibrahimm1](https://github.com/mibrahimm1)
* ✉️ **Email:** [m.ibrahimshaikh357@gmail.com](mailto:m.ibrahimshaikh357@gmail.com)
* 📱 **Phone:** `+92 318 2228891` (`0318-2228891`)
* 📅 **Book a Call:** [Schedule a Meeting on Google Meet](https://calendar.app.google/PCPWdsfLosf2QBAz8)
* 📄 **Standard Portfolio / Résumé:** Available directly at `/resume` with a 1-page ATS-formatted print view.

---

## 🚀 Key Highlights & Engineering Track Record

* **Konvex (AI-Native E-Commerce Assistant):** Leading a 4-person capstone team building a multi-agent state graph that unifies WhatsApp, Instagram, Shopify, and WooCommerce into a live inbox with hybrid semantic search and 0% pricing hallucination.
* **BizBuddy (89% LLM Cost Reduction):** Replaced regex model parsing with a 9-tool calling architecture, restructured dynamic prompt compilation, and benchmarked models to cut cost by 89% across 157,000+ messages and 2,900+ orders.
* **Horquva LLC (Enterprise Blast Radius Simulations):** Modeled organizational security vulnerabilities as topological dependency graphs across 58 tables with strict Row-Level Security (RLS).
* **Multimodal Medical Diagnostic AI:** Trained YOLOv8 models on 14,000+ chest X-rays (0.99 mAP@50 healthy detection) combined with Google Gemini multi-turn clinical grounding.
* **Code Connect 2025 AI Hackathon:** **1st Place** among 20+ national teams for building a WebRTC video application with real-time bidirectional multilingual speech translation.

---

## 🎧 The Portfolio Metaphor: Why Spotify?

This portfolio translates a developer's career into an authentic music client interface:

| Spotify Metaphor | Portfolio Reality |
|---|---|
| **Tracks** | Production AI systems, work experiences, publications, education, and credentials |
| **Playlists** | Curated categories (*Featured Projects*, *Work Experience*, *Education*, *Research*, *Volunteering*, *Certifications*) |
| **Top Artists** | Core engineering stack (*Python, LangChain, PyTorch, n8n, FastAPI, RAG, LLMs, Postgres*) acting as dynamic filtered playlists |
| **Now Playing Inspector** | Right-sidebar technical deep dives with cover artwork, architecture hooks, narrative overviews, and live GitHub/demo links |
| **Recruiter Mix** | Visitors bookmark projects with the `+` icon, automatically compiling a custom mix to email or attach to a Google Meet booking call |
| **Lyrics Mode** | Synchronized personal cover letter that scrolls in time with a visual audio scrubber |
| **Standard Portfolio (`/resume`)** | Traditional paper-and-ink single-page portfolio with rotating headline, local timezone clock, and printable 1-page ATS résumé |

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 15 (App Router, static export `output: 'export'`)
* **Core:** React 18, TypeScript, Zustand 5 (atomic selectors, zero 1Hz re-render overhead)
* **Styling & Tokens:** Tailwind CSS 3.4 with authentic Spotify Encore color scales and responsive typography (`FitTitle`)
* **Validation:** Zod schema enforcement for all content, SafeUrl protocols, and image path confinements
* **Security:** Strict Content-Security-Policy with sha256 script hashing, zero-trust headers, and full static build isolation
* **Testing:** 172 Vitest unit tests + 65 Playwright end-to-end tests across desktop, Android (Pixel 7), and iOS (iPhone 14) viewports

> **Disclaimer:** Not affiliated with Spotify. This is an independent portfolio project inspired by the Spotify desktop and mobile applications. It contains no proprietary Spotify logos, fonts, or assets.

---

## 🌟 Make It Yours in 5 Minutes (Open-Source Template)

Want to use this design for your own developer portfolio? This repository is built as an open-source template. You can fork it, fill in your details via a visual CMS, and deploy it to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

### Step 1: Fork and Clone
Fork this repository to your GitHub account, then clone it locally:
```bash
git clone https://github.com/<your-username>/ibrahim-portfolio-spotify.git
cd ibrahim-portfolio-spotify
npm ci
```

### Step 2: Run the 1-Step Setup Script
Run the automated cleanup script to replace the personal content with a neutral template and set your username:
```bash
npm run setup -- --github <your-github-username>
```
*What this does automatically:*
- Backs up existing content to `content/.backups/`.
- Resets `content/portfolio.json` to the neutral example template (`portfolio.example.json`).
- Resets `public/resume.pdf` to a clean placeholder.
- Cleans out personal images from `public/uploads/`.
- Sets your GitHub handle in `.github/CODEOWNERS`.

### Step 3: Edit Your Content Visually
Start the local development server:
```bash
npm run dev
```
Open **[http://localhost:3000/dashboard](http://localhost:3000/dashboard)** in your browser:
* Visually edit your profile, projects, experiences, education, and contact links.
* Upload your avatar, project covers, and custom resume PDF.
* Customize your accent color palettes and AI assistant answers with instant live preview.
* Every save validates against the schema and creates an atomic rolling backup.
*(The dashboard is strictly dev-only and is completely omitted from production builds).*

### Step 4: Validate and Build
Verify that your content passes all schema checks and builds a clean static export:
```bash
npm run build
```
Preview the exact static production bundle locally:
```bash
npm run preview
# Serves out/ at http://127.0.0.1:4173 with full production security headers
```

### Step 5: Deploy

| Host | Deployment Steps |
|---|---|
| **Vercel** | Import your repository. The included [`vercel.json`](vercel.json) automatically sets `output: "out"` and injects security headers. |
| **Netlify** | Import your repository. The included [`netlify.toml`](netlify.toml) runs `npm run build` and publishes `out/`. |
| **Cloudflare Pages** | Set build command `npm run build` and output directory `out`. It automatically reads [`out/_headers`](scripts/security-headers.mjs). |
| **GitHub Pages** | In repo **Settings → Pages**, choose **"GitHub Actions"**. Set repository variable `DEPLOY_TO_PAGES=true`. The included workflow ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)) deploys on every push to `main`. |

---

## 🧪 Tests That Never Break on Forking

Unlike typical personal portfolios where tests hardcode the author's name and break the moment you edit content:
* All unit and Playwright E2E tests run against an **isolated test fixture** ([`tests/fixtures/portfolio.json`](tests/fixtures/portfolio.json)) using the `@portfolio-content` path alias.
* You can completely rewrite `content/portfolio.json`, and **your GitHub Actions CI and CodeQL security pipelines will still pass 100% cleanly**.

---

## 📜 Available Scripts

| Script | Command / Description |
|---|---|
| `npm run dev` | Starts local dev server at `127.0.0.1:3000` with visual dashboard at `/dashboard` |
| `npm run build` | Validates schema, compiles static export to `out/`, hashes CSP inline scripts, and verifies build |
| `npm run preview` | Serves static production export at `http://127.0.0.1:4173` |
| `npm run test:unit` | Executes 172 Vitest unit tests |
| `npm run test:e2e` | Runs 65 Playwright E2E tests across Chromium, Android, and iOS viewports |
| `npm run content:validate` | Validates `content/portfolio.json` against the strict Zod schema |
| `npm run setup` | One-time setup script for open-source forkers (`--github <username>`) |

---

## 🔒 Security & Verification

* **Static Immutability:** There is zero server runtime in production. No database, no API routes, and no routes accept write requests.
* **Hashed CSP:** Every static page has an inline SHA-256 Content-Security-Policy `<meta>` tag preventing script injection.
* **Leak Detection:** `scripts/verify-build.mjs` halts the build if any dev dashboard code, source maps, or unhashed scripts leak into `out/`.

---

## 📄 License

* Source code is licensed under the [MIT License](LICENSE).
* Typography: Figtree font is licensed under the [SIL Open Font License 1.1](public/fonts/LICENSE).
* Personal project narratives and media belong to Muhammad Ibrahim Shaikh. Open-source forkers should run `npm run setup` to populate their own content.
