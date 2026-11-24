# UI/UX Master Blueprint & Component Architecture

**Project:** Muhammad Ibrahim Shaikh — 1:1 Spotify Desktop Portfolio

**Document Version:** 2.0 (Updated with Canonical Spotify Design System Tokens, Scales & Component Shells)

**Date:** October 29, 2026

**Design Target:** Desktop Web Application (`>= 1024px`, 1:1 Spotify Desktop Client Fidelity)

## 1. Spotify Design System Foundations (01 · Color, 02 · Typography, 03 · Foundations)

All visual tokens, scales, and component dimensions in this blueprint are anchored directly to the canonical **Spotify Design System** boards (`01 · Color`, `02 · Typography`, `03 · Foundations`, `04 · Components`, and `05 · Artwork`).

### 1.1 Color System (`01 · Color`)

#### A. Brand Green Scale (`green/100` to `green/1000`)

| Token | Hex Value | Text Contrast | Portfolio Usage |
| :--- | :--- | :--- | :--- |
| `green/100` | `#d8fae4` | `#121212` | Subtle badge tint / high-light accent |
| `green/200` | `#b1f4c9` | `#121212` | Hover glow tint |
| `green/300` | `#8befae` | `#121212` | Secondary chart / visualizer highlight |
| `green/400` | `#64e994` | `#121212` | Active badge border |
| `green/500` | `#3de479` | `#121212` | Bright hover state for primary controls |
| **`green/600` (Brand)** | **`#1ed760`** | **`#121212`** | **Canonical Spotify Brand Primary**: Primary buttons, active track titles, progress scrubber fill, section tags, and play buttons |
| `green/700` | `#1ab752` | `#121212` | Pressed / active state for primary buttons |
| `green/800` | `#159743` | `#ffffff` | Deep accent banner gradient stop |
| `green/900` | `#117735` | `#ffffff` | Dark green banner backdrop |
| `green/1000` | `#0c5727` | `#ffffff` | Ambient header gradient base stop |

#### B. Dark Scale (`dark/100` to `dark/1000`) & True Black Shell

| Token | Hex Value | Text Contrast | Portfolio Usage |
| :--- | :--- | :--- | :--- |
| `dark/100` | `#d4d4d4` | `#121212` | High-emphasis secondary label |
| `dark/200` | `#bebebe` | `#121212` | Hover state for muted icons |
| **`dark/300`** | **`#a9a9a9`** | **`#121212`** | **Canonical Secondary Text & Input Placeholder**: Subtitles, artist/company names, track durations, table metadata, and search placeholder |
| `dark/400` | `#939393` | `#ffffff` | Muted metadata & inactive timestamps |
| `dark/500` | `#7e7e7e` | `#ffffff` | Subtle icon strokes |
| `dark/600` | `#686868` | `#ffffff` | Disabled control text |
| **`dark/700`** | **`#535353`** | **`#ffffff`** | **Default Artwork / Avatar Placeholder Fill**: Used for `40x40` user avatar circles, `148x148` card placeholders, `55x55` compact card thumbnails, `32x32` track thumbnails, and `56x56` bottom player art |
| `dark/800` | `#3d3d3d` | `#ffffff` | Tooltip and elevated menu border |
| **`dark/900`** | **`#282828`** | **`#ffffff`** | **Elevated Surface**: Floating AI Search Dropdown popover, modals, theme switcher menu, and radius token tiles |
| **`dark/1000`** | **`#121212`** | **`#ffffff`** | **Primary Panel Canvas**: Base surface for Left Sidebar, Center Main Stage, Right Contextual Sidebar, and dark button text |
| `shell/black` | `#000000` | `#ffffff` | Outer desktop viewport frame (`8px` gaps) and **Bottom Control Bar (`1408 × 77`)** background |

#### C. Neutral Scale (`neutral/100` to `neutral/1000`)

| Token | Hex Value | Text Contrast | Portfolio Usage |
| :--- | :--- | :--- | :--- |
| **`neutral/100`** | **`#ffffff`** | **`#121212`** | **Primary Foreground Text**, active filter chip fill (`All`), and bottom bar Play/Pause circular button fill (`32x32`) |
| `neutral/200` | `#e8e8e8` | `#121212` | Hover state for white buttons and pills |
| `neutral/300` | `#d2d2d2` | `#121212` | Pressed state for white controls |
| `neutral/400` | `#bbbbbb` | `#121212` | Secondary neutral text |
| `neutral/500` | `#a4a4a4` | `#121212` | Muted neutral icon |
| `neutral/600` | `#8e8e8e` | `#ffffff` | Subtle neutral divider |
| `neutral/700` | `#777777` | `#ffffff` | Inactive neutral badge |
| `neutral/800` | `#606060` | `#ffffff` | Scrollbar thumb default |
| `neutral/900` | `#4a4a4a` | `#ffffff` | Elevated card border |
| `neutral/1000` | `#333333` | `#ffffff` | Lyrics Mode stage backdrop |

#### D. Semantic Feedback Scale

| Token | Hex Value | Text Contrast | Portfolio Usage |
| :--- | :--- | :--- | :--- |
| `error/100` | `#fb3748` | `#ffffff` | Form validation error text & border |
| `error/200` | `#d00416` | `#ffffff` | Destructive action / error banner fill |
| `warning/100` | `#ffdb43` | `#121212` | `"In Development"` status badge (`Konvex` FYP) |
| `warning/200` | `#dfb400` | `#121212` | Warning toast accent |
| `success/100` | `#84ebb4` | `#121212` | Clipboard copy & booking confirmation toast |
| `success/200` | `#1fc16b` | `#121212` | Verified badge & live deployment indicator |

#### E. White Overlays (`Grey 0` to `Grey 6`)

Translucent white overlays on `#121212` (`dark/1000`) create glassmorphic depth across cards, rows, pills, and progress bars without hard borders:

| Overlay Token | CSS Value | Opacity | Canonical Component Usage in `04 · Components` |
| :--- | :--- | :--- | :--- |
| **`Grey 0`** | `rgba(255, 255, 255, 0.04)` | White 4% | **Vertical Playlist Card (`180 × 231`)** default background fill |
| **`Grey 1`** | `rgba(255, 255, 255, 0.08)` | White 8% | **Horizontal Compact Card (`395 × 55`)** fill and **Active / Hover Song List Row (`1213 × 45`)** fill |
| **`Grey 2`** | `rgba(255, 255, 255, 0.12)` | White 12% | **Search Bar Pill (`540 × 53`)** fill, **Inactive Filter Chip (`Music` / Contact Pills)** fill, and **Bottom Control Bar (`77px`)** top border (`1px solid`) |
| **`Grey 3`** | `rgba(255, 255, 255, 0.20)` | White 20% | Hover state for Search Bar Pill and Filter Chips |
| **`Grey 4`** | `rgba(255, 255, 255, 0.30)` | White 30% | **Bottom Scrubber Unfilled Track (`height: 4px`)** background and foundation container borders |
| **`Grey 5`** | `rgba(255, 255, 255, 0.40)` | White 40% | Inactive Lyrics Mode stanzas and subtle focus rings |
| **`Grey 6`** | `rgba(255, 255, 255, 0.50)` | White 50% | **Secondary Outline Button (`167 × 35`)** border (`1px solid rgba(255, 255, 255, 0.50)`) |

#### F. Decorative Palette (For Artwork Tiles, Circular Artist Avatars & Card Accents)

From `01 · Color` and `05 · Artwork`, Spotify pairs its dark `#121212` shell with 10 vibrant decorative colors for `200 × 200` cover tiles and circular artist avatars:

| Decorative Name | Hex Value | Text Color | Assigned Portfolio Artwork / Avatar |
| :--- | :--- | :--- | :--- |
| **Green (alt)** | `#57B660` | `#121212` | *n8n Automation* avatar & *Autonomous Gmail Monitoring Agent* cover |
| **Black** | `#181414` | `#ffffff` | High-contrast vinyl / terminal badge overlay |
| **Blue Moon** | `#649AED` | `#121212` | *Python* avatar, *Work Experience* playlist tile, & *Sonyc Multimodal RAG* cover |
| **Red Red Wine** | `#EB5640` | `#ffffff` | *PyTorch & Computer Vision* avatar, *Featured Projects* playlist tile, *Multimodal Medical Report Analyzer* cover, & `Lyrics preview` card |
| **Mellow Yellow** | `#F6C874` | `#121212` | *FastAPI & Next.js* avatar, *Certifications & Honors* playlist tile, & *Code Connect '25 Winner* cover |
| **Pink Moon** | `#E57BA1` | `#121212` | *LLMs & Multimodal AI* avatar, *Your Recruiter Mix* playlist tile, & *Brain Tumor Detection* cover |
| **Whiter Shade of Pale** | `#A7C2D1` | `#121212` | *PostgreSQL & AWS* avatar, *Education* playlist tile, & *Konvex (FYP)* cover |
| **Evergreen** | `#D5F479` | `#121212` | *LangChain & LangGraph* avatar, *Research & Publications* playlist tile, & *Edge IoT Voice Assistant* cover |
| **Pretty in Pink** | `#F7CFD4` | `#121212` | *Volunteering & Leadership* playlist tile & recommender highlight cards |
| **Yellow Submarine** | `#F4E357` | `#121212` | *RAG & Vector DBs* avatar & *WhatsApp Chat Analytics* cover |

#### G. Swappable Accent Color Themes (Controlled via Profile Settings Gear `⚙`)

Clicking the **Settings Gear (`⚙`)** on the Home Profile action bar opens a compact theme picker that swaps the primary brand token (`--accent-primary`, defaulting to `green/600` `#1ed760`) and active hover token (`--accent-hover`, defaulting to `green/500` `#3de479`) across all buttons, active track titles, progress bars, and header gradients:

| Theme Name | `--accent-primary` | `--accent-hover` | `--accent-pressed` | Header Banner Gradient (`--banner-gradient`) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Spotify Green (Default)** | `#1ed760` (`green/600`) | `#3de479` (`green/500`) | `#1ab752` (`green/700`) | `linear-gradient(180deg, #117735 0%, #121212 100%)` |
| **2. Electric Purple** | `#8B5CF6` | `#A78BFA` | `#7C3AED` | `linear-gradient(180deg, #4C1D95 0%, #121212 100%)` |
| **3. Cyber Orange** | `#FF6B00` | `#FF8533` | `#EA580C` | `linear-gradient(180deg, #7C2D12 0%, #121212 100%)` |
| **4. Crimson Red** | `#fb3748` (`error/100`) | `#FF6B78` | `#d00416` (`error/200`) | `linear-gradient(180deg, #7F1D1D 0%, #121212 100%)` |
| **5. Ocean Blue** | `#649AED` (`Blue Moon`) | `#93C5FD` | `#3B82F6` | `linear-gradient(180deg, #0C4A6E 0%, #121212 100%)` |

### 1.2 Typography System (`02 · Typography`)

* **Font Family Stack:** `'Circular Spotify Text', 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif`
  * **Primary Proprietary Face:** `Circular Spotify Text` (`Black` `900` for headings, `Bold` `700` for interactive controls/track titles, `Book` `400` for body copy).
  * **Open Web Font Fallback:** `Figtree` (loaded via `@font-face` in `400`, `700`, and `900` weights with `font-display: swap`).
* **Line-Height Principle:** All 9 Heading tokens and 4 Body tokens follow a strict **`1.5` line-height ratio**.

#### A. Heading Scale (`Headings/H-1` to `Headings/H-9` — Weight `900` / Black)

| Token | Size / Line-Height | Weight | Portfolio Component Mapping |
| :--- | :--- | :--- | :--- |
| `Headings/H-1` | `98px / 147px` | `900` (Black) | Oversized Hero Display Option (`ibrahimm` ultra-wide display) |
| `Headings/H-2` | `82px / 123px` | `900` (Black) | Hero Profile Display Name (`Muhammad Ibrahim Shaikh` on `>= 1440px` viewports) |
| `Headings/H-3` | `68px / 102px` | `900` (Black) | Playlist Header Display Title (`Featured Projects`, `Work Experience`) |
| `Headings/H-4` | `56px / 84px` | `900` (Black) | Recommender Profile Display Title (`Dr. Saeed Murtaza`, `Asst. Prof. Khawir Mahmood`) |
| `Headings/H-5` | `46px / 69px` | `900` (Black) | Compact Playlist / Modal Hero Title (`Your Recruiter Mix`) |
| `Headings/H-6` | `38px / 57px` | `900` (Black) | Highlight Metric Callout inside `About the Project` card |
| `Headings/H-7` | `32px / 48px` | `900` (Black) | **Lyrics Mode Stanza Typography** (Personal Cover Letter active & inactive stanzas) |
| `Headings/H-8` | `26px / 39px` | `900` (Black) | Right Sidebar Active Track Title (`Konvex`, `Horquva LLC`) |
| `Headings/H-9` | `22px / 33px` | `900` (Black) | **Section Headings** (`Top artists this month`, `Public Playlists`, `About the Project`, `Credits`) |

#### B. Body Scale (`Body/B-1` to `Body/B-4` — Weight `400` / Book & `700` / Bold)

| Token | Size / Line-Height | Weight | Portfolio Component Mapping |
| :--- | :--- | :--- | :--- |
| `Body/B-1` | `18px / 27px` | `400` (Book) / `700` (Bold) | Recommender Letter lead quote & Hero banner tagline |
| `Body/B-2` | `16px / 24px` | `400` (Book) / `700` (Bold) | **Search Bar input text (`540 × 53`)**, **Vertical Card Title (`180 × 231`, Bold)**, **Horizontal Card Title (`395 × 55`, Bold)**, and `About` card body narrative |
| `Body/B-3` | `14px / 21px` | `400` (Book) / `700` (Bold) | **Song List Row (`1213 × 45`)** track title (Bold) & album/duration cells (Book), **Primary/Secondary Buttons (`167 × 35`, Bold)**, **Bottom Bar Track Title (`56 × 56` cluster, Bold)**, and vertical card description (`#a9a9a9`) |
| `Body/B-4` | `12px / 18px` | `400` (Book) / `700` (Bold) | **Song List Row Artist/Subtitle (`#a9a9a9`)**, **Bottom Bar Artist/Subtitle (`#a9a9a9`)**, Left Sidebar metadata counters, and color/token badges |

### 1.3 Foundations: Spacing, Radius & Stroke Scales (`03 · Foundations`)

#### A. Fixed Spacing Scale (`#spacing-0` to `#spacing-10`)

| Token | Value | Component & Layout Usage |
| :--- | :--- | :--- |
| `#spacing-0` | `2px` | Tight text stacking between Track Title (`14px`) and Artist Subtitle (`12px`) |
| `#spacing-1` | `4px` | Vertical gap between Song List rows (`gap: 4px`) |
| `#spacing-2` | `8px` | Outer desktop grid gap (`8px`), swatch grid gap, and bottom player play-button-to-scrubber margin |
| `#spacing-3` | `12px` | Search bar icon-to-input gap, Bottom Bar artwork-to-title gap, Vertical Card artwork bottom margin, and `200x200` Artwork tile inner padding |
| `#spacing-4` | `16px` | Standard component padding: Vertical Card padding (`16px`), Song List row horizontal padding (`0 16px`) & internal column gap (`16px`), Filter Chip horizontal padding (`0 16px`), and Bottom Bar horizontal padding (`0 16px`) |
| `#spacing-5` | `20px` | Search Bar Pill horizontal padding (`0 20px`) |
| `#spacing-6` | `24px` | Control bar item gap (`gap: 24px`), Card row gap (`gap: 24px`), and Typography table column gap |
| `#spacing-7` | `32px` | Major vertical section gap inside panels (`gap: 32px`) |
| `#spacing-8` | `40px` | Playlist header artwork-to-text gap |
| `#spacing-9` | `48px` | Board outer margin |
| `#spacing-10` | `56px` | Full-bleed desktop showcase container padding (`56px`) |

#### B. Border Radius Scale (`#radius-none` to `#radius-full`)

| Token | Value | Component Usage |
| :--- | :--- | :--- |
| `#radius-none` | `0px` | Outer viewport frame and Bottom Control Bar (`1408 × 77`) |
| **`#radius-1`** | **`4px`** | **Song List Row (`1213 × 45`)**, **Track Row Thumbnail (`32 × 32`)**, **Bottom Player Cover (`56 × 56`)**, **Horizontal Compact Card (`395 × 55`)**, and **`200 × 200` Playlist & Album Artwork Tiles** |
| **`#radius-2`** | **`8px`** | **Left/Center/Right Layout Panels**, **Vertical Playlist Card (`180 × 231`)** & its inner **`148 × 148` Cover Art**, Right Sidebar inner cards, and AI Search Dropdown Popover |
| `#radius-3` | `12px` | Modal dialog container (`Send Mix & Book Call`) |
| `#radius-4` | `16px` | Highlighted feature banner cards |
| **`#radius-full`** | **`999px`** | **Primary & Secondary Buttons (`167 × 35`)**, **Filter Chips (`height: 40px`)**, **Search Bar Pill (`540 × 53`)**, **Avatar Badge (`40 × 40`)**, **Bottom Play/Pause Button (`32 × 32`)**, **Progress Scrubber (`height: 4px`)**, and **Circular Artist Avatars (`200 × 200`)** |

#### C. Stroke Scale (`#stroke-0` to `#stroke-4`)

* `#stroke-0` (`0px`): Default borderless surface for filled buttons, chips, and cards.
* `#stroke-1` (`1px`): Secondary Button border (`1px solid rgba(255,255,255,0.50)`), Bottom Control Bar top divider (`1px solid rgba(255,255,255,0.12)`), and subtle card outlines.
* `#stroke-2` (`2px`): Search icon SVG stroke width (`stroke-width: 2`) and focus ring indicator.
* `#stroke-3` (`3px`) & `#stroke-4` (`4px`): Active tab underline and equalizer bar thickness.

## 2. Canonical Layout Shells & Component Specifications (`04 · Components` & `05 · Artwork`)

### 2.1 Master Desktop Shell Reference Dimensions (`04 · Components → Layout shells`)

From the `Layout shells` specification in `04 · Components`, the desktop application frame (`1408px+` reference canvas width, responsive flex/grid on `>= 1024px`) is governed by 7 canonical shell dimensions:

| Layout Shell Name | Canonical Reference Dimensions | Portfolio Zone & Behavioral Mapping |
| :--- | :--- | :--- |
| **1. Top nav bar** | `1330 × 54` (`height: 54px`) | **Zone 1 (Top Bar):** Houses History arrows, Home button (`🏠`), Search Bar (`540 × 53`), Bell icon (`🔔`), Friends Activity icon (`👥`), Profile Avatar (`40 × 40`), and Escape Hatch Minimize button (`-`) |
| **2. Side bar (Left Library)** | `83px` closed · `334px` open, `692px` tall | **Zone 2 (Left Sidebar — `Your Library`):** Supports collapsed icon-rail state (`83px` wide showing only `48 × 48` cover thumbnails) and expanded state (`334px` wide showing Contact Filter Chips + 7 Library playlists) |
| **3. Album cover (Hero Banner)** | `1335 × 256` (`height: 256px`) | **Zone 3 Top Hero Header:** Used for the Candidate Home Profile banner, Playlist Header banner, and Recommender Profile banner |
| **4. Song list row** | `1213 × 45` (`height: 45px`) | **Zone 3 Tracklist Table Row:** Standardized `45px` tall interactive row for Projects, Work Experience, Education, Publications, Leadership, and Certifications |
| **5. Main card (Right Inspector)** | `442 × 528` (`width: 340px–442px`) | **Zone 4 (Right Contextual Sidebar):** Houses the `Now Playing` Track Inspector (`About the Project`, `Credits`, `Next in queue`) and toggles to `Listening activity` |
| **6.Scroll bar** | `14 × 708` (`width: 14px`) | Custom dark overlay scrollbar track (`14px` wide) inside Left Sidebar, Center Stage, and Right Sidebar |
| **7. Bottom control** | `1408 × 77` (`height: 77px` · `play`, `pause`) | **Zone 5 (Persistent Bottom Player Bar):** Pure black (`#000000`) `77px` bar with `1px solid rgba(255,255,255,0.12)` top border |

### 2.2 Canonical Component Anatomy (`04 · Components`)

Every interactive control in the portfolio must match these exact CSS metrics from `04 · Components`:

| Component | Exact Dimensions & Box Model | Typography & Fill Tokens | Portfolio Usage |
| :--- | :--- | :--- | :--- |
| **Primary Button** | `width: 167px` (or `padding: 0 24px`), `height: 35px`, `border-radius: 999px`, `border: 0`, `cursor: pointer` | `Body/B-3` (`14px`), `font-weight: 700`, `background: #1ed760` (`green/600` or `var(--accent-primary)`), `color: #121212` | **`📅 Book a Call`** on Home Profile and **`Send & Book`** in the Recruiter Mix modal |
| **Secondary Button** | `width: 167px` (or `padding: 0 24px`), `height: 35px`, `border-radius: 999px`, `border: 1px solid rgba(255,255,255,0.50)` (`Grey 6`) | `Body/B-3` (`14px`), `font-weight: 700`, `background: transparent`, `color: #ffffff` | **`⬇ Download Resume`**, **`✎ Send Mix & Book Call`**, **`Live Demo ↗`**, and **`Open Google Scholar ↗`** |
| **Avatar Badge (`S` / `I`)** | `width: 40px`, `height: 40px`, `border-radius: 999px`, flex-centered | `font-weight: 700`, `background: #535353` (`dark/700`), `color: #ffffff` | Top-right user profile avatar pill and recommender initials fallback |
| **Filter Chip (Active)** | `height: 40px`, `padding: 0 16px`, `border: 0`, `border-radius: 999px` | `font-weight: 700`, `background: #ffffff` (`neutral/100`), `color: #121212` (`dark/1000`) | Active contact pill or active view state |
| **Filter Chip (Inactive)** | `height: 40px`, `padding: 0 16px`, `border: 0`, `border-radius: 999px` | `font-weight: 700`, `background: rgba(255,255,255,0.12)` (`Grey 2`), `color: #ffffff` | Left Sidebar Direct Contact & Social Pills (`GitHub ↗`, `LinkedIn ↗`, `Email ✉`, `Phone: 0318-2228891`, `📍 ISB / KHI · Remote`) |
| **Search Input Bar** | `width: 540px`, `height: 53px`, `padding: 0 20px`, `gap: 12px`, `border-radius: 999px`, `box-sizing: border-box` | Fill: `rgba(255,255,255,0.12)` (`Grey 2`); Icon: `20 × 20` SVG (`#a9a9a9`, `stroke-width: 2`); Input: `16px` (`Body/B-2`), `#ffffff`, placeholder `#a9a9a9` | Top Bar **AI Search / Chatbot Entry Point** (`"What do you want to play? / Ask Ibrahim's AI..."`) |
| **Vertical Playlist Card** | `width: 180px`, `height: 231px`, `padding: 16px`, `border-radius: 8px` (`#radius-2`), `box-sizing: border-box` | Card Fill: `rgba(255,255,255,0.04)` (`Grey 0`); Artwork: `148 × 148`, `border-radius: 8px`, `margin-bottom: 12px`; Title: `16px` bold `#ffffff`; Description: `14px` `#a9a9a9` | Home Profile **`Public Playlists`** grid cards (`Featured Projects`, `Work Experience`, `Education`, etc.) |
| **Horizontal Compact Card** | `width: 395px`, `height: 55px`, `gap: 16px`, `border-radius: 4px` (`#radius-1`), `overflow: hidden` | Fill: `rgba(255,255,255,0.08)` (`Grey 1`); Left Flush Cover: `55 × 55` (`#535353`, `flex: none`); Title: `16px` bold `#ffffff` | Quick-access pinned cards at the top of the Home Dashboard or inside Recommender Profiles |
| **Song List Row (Default & Active)** | `width: 100%` (`1213px` ref), `height: 45px`, `padding: 0 16px`, `gap: 16px`, `border-radius: 4px` (`#radius-1`), row stack `gap: 4px` | Default Fill: `transparent`, Title `#ffffff` (`14px` bold); Active/Playing Fill: `rgba(255,255,255,0.08)` (`Grey 1`), Title `#1ed760` (`green/600` or `var(--accent-primary)`). Index (`width: 24px`, `#a9a9a9`), Cover (`32 × 32`, `border-radius: 4px`), Title (`14px` bold) + Subtitle (`12px` `#a9a9a9`, `flex: 1`), Album (`width: 260px`, `#a9a9a9`), Duration (`#a9a9a9`) | Every track row across all 7 Portfolio Playlists |
| **Bottom Control Bar (`play` / `pause`)** | `width: 100%` (`1408px` ref), `height: 77px`, `padding: 0 16px`, `background: #000000`, `border-top: 1px solid rgba(255,255,255,0.12)` | **Left (`width: 300px`, `gap: 12px`):** `56 × 56` cover (`border-radius: 4px`), Title (`14px` bold `#ffffff`), Artist (`12px` `#a9a9a9`). **Center (`width: 480px`):** `32 × 32` circular button (`border-radius: 999px`, `#ffffff` fill, `16 × 16` `#121212` Play/Pause SVG, `margin-bottom: 8px`) + `4px` progress bar (`border-radius: 999px`, track `rgba(255,255,255,0.30)`, fill `#1ed760`). **Right (`width: 300px`):** Lyrics Mic & utility controls | Zone 5 Persistent Bottom Player Bar |

### 2.3 Artwork Tile System (`05 · Artwork`)

From `05 · Artwork`, showcase tiles use a **5-column grid (`grid-template-columns: repeat(5, 1fr); gap: 22px`)** of `200px × 200px` (`aspect-ratio: 1`) tiles with `padding: 12px`, `font-weight: 900` (Black), and `font-size: 20px` bottom-left typography:

* **Artists (`border-radius: 999px` — Circular):** Used for the 8 Core Technology avatars in `"Top artists this month"` and the Endorsed Competency badges on Recommender Profiles.
* **Playlists & Albums (`border-radius: 4px` — Square):** Used for the 7 Portfolio Playlists and 8 Featured Project album covers, combining custom graphics/icons with the Decorative color palette (`#A7C2D1`, `#D5F479`, `#649AED`, `#EB5640`, `#F6C874`, `#E57BA1`).

## 3. Zone-by-Zone Screen & Interaction Blueprint

### 3.1 Zone 1: Top Navigation Bar (`1330 × 54`) & The AI Chatbot Dropdown (`image_d96b7d.jpg` & `image_d968d4.jpg`)

#### A. Left & Center Controls

* **Window Dots (`•••`) & History Arrows (`<` `>`):** Step backward/forward through visited screens.
* **Home Button (`🏠` Circular Button, `40px × 40px`, `rgba(255,255,255,0.12)` `Grey 2`):** Single click immediately returns Zone 3 (Center Stage) to the `Muhammad Ibrahim Shaikh` Home Profile.
* **AI Search Bar (`width: 540px`, `height: 53px`, `padding: 0 20px`, `gap: 12px`, `border-radius: 999px`, `background: rgba(255,255,255,0.12)` `Grey 2`):**
  * Left icon: `20 × 20` Magnifying glass SVG (`stroke: #a9a9a9`, `stroke-width: 2`).
  * Placeholder text (`16px` `Body/B-2`, `#a9a9a9`): `"What do you want to play? — Ask Ibrahim's AI anything..."`.
  * Right icon: Browse/Chat badge.

#### B. The AI Chatbot Dropdown Popover (Modeled on Screenshot 4 `image_d968d4.jpg`)

When the user clicks inside the `540 × 53` Search Bar, a floating dark card (`width: 540px`, `max-height: 540px`, `background: #282828` `dark/900`, `border-radius: 8px` `#radius-2`, `box-shadow: 0 16px 24px rgba(0,0,0,0.5)`, `z-index: 100`) drops down directly beneath the input bar while keeping the entire dashboard visible behind it:

* **State 1: Initial Empty State (`Recent searches`):**
  * Header label: **`Suggested Questions (Recent searches)`** (`14px` `Body/B-3` Bold `#ffffff`).
  * 5 clickable rows (`height: 45px`, hover fill `rgba(255,255,255,0.08)` `Grey 1`, each with a `32 × 32` `border-radius: 4px` icon thumbnail, bold prompt title, `#a9a9a9` subtitle tag, and `×` icon on the right):
    1. **What production agentic systems have you built?** — *AI Architecture · BizBuddy & Horquva*
    2. **How did you cut LLM costs by 89% at BizBuddy?** — *Case Study · Qwen 3.6 Flash Migration*
    3. **Tell me about your Final Year Project (Konvex)** — *Multi-Agent E-Commerce · MCS NUST*
    4. **How did you win 1st place at the NUST AI Hackathon?** — *Code Connect '25 · Real-Time WebRTC + Gemini*
    5. **Are you available for full-time or remote roles?** — *Availability · Islamabad / Karachi / Remote*
* **State 2: Active Conversational Chat Thread:**
  * Clicking any starter row or typing a question into the search bar and pressing `Enter` transitions the dropdown body into a scrollable **Spotify-styled Chat Thread**:
    * **User Message Bubble:** Right-aligned pill (`background: var(--accent-primary)` `#1ed760`, `color: #121212`, `font-size: 14px`, `font-weight: 700`, `border-radius: 16px`).
    * **Ibrahim AI Response Card:** Left-aligned card (`background: rgba(255,255,255,0.08)` `Grey 1`, `border-radius: 8px`, avatar badge `ibrahimm AI`) speaking in the **first person** (*"At BizBuddy, I architected our Gen-4 Nexus engine..."*) with clickable inline chips that load the referenced project directly into the Right Sidebar.
    * **Bottom Follow-Up Input / Clear Thread Button:** Lets the user ask follow-up questions directly inside the search bar or click `Clear chat` to return to the 5 starter prompts.

#### C. Top-Right Utility & Window Controls

* **Bell Icon (`🔔`):** Static visual icon (does nothing on click).
* **Friends Activity Icon (`👥`):** Toggles Zone 4 (Right Sidebar) between the **`Now Playing` Inspector** and the **`Listening activity` Recommendations Feed**.
* **Profile Avatar Pill (`40px × 40px`, `border-radius: 999px`, `background: #535353` `dark/700`):** Circular thumbnail / `I` monogram of Muhammad Ibrahim Shaikh; clicking navigates to Home Profile.
* **Minimize Button (`-`) — The Recruiter Escape Hatch:** Displays a persistent subtle pill badge or immediate hover tooltip (`"Standard Resume View"`). Clicking it exits the Spotify UI and loads the separate traditional portfolio view.

### 3.2 Zone 2: Left Sidebar (`Your Library` — `83px` Closed / `334px` Open × `692px` Tall) (`image_d96b7d.jpg`)

* **Collapsible Shell Geometry:** Defaults to `334px` wide (`open` state) on desktop (`#121212` `dark/1000`, `border-radius: 8px` `#radius-2`). Clicking the `Your Library` icon collapses the panel to `83px` wide (`closed` state) showing only the vertical stack of `48 × 48` (`#radius-1` `4px`) playlist cover thumbnails.
* **Header Row:** Book/Library icon + `"Your Library"` title (`16px` bold `#a9a9a9`) + `+ Contact` button (opens the Booking Modal) + Expand arrow.
* **Horizontal Scrollable Filter Chips (Direct Contact & Social Links — `height: 40px`, `padding: 0 16px`, `border-radius: 999px`, `background: rgba(255,255,255,0.12)` `Grey 2`):**
  * Instead of filtering playlists, clicking these pills triggers immediate external actions (with a subtle external-link/copy icon on hover):
    1. **`GitHub ↗`** → Opens [github.com/mibrahimm1](https://github.com/mibrahimm1)
    2. **`LinkedIn ↗`** → Opens [linkedin.com/in/ibrahimshaikhh](https://www.linkedin.com/in/ibrahimshaikhh/)
    3. **`Email ✉`** → Opens `mailto:m.ibrahimshaikh357@gmail.com` (and copies email to clipboard with a `#84ebb4` `success/100` toast `"Email copied to clipboard"`)
    4. **`Phone: 0318-2228891`** → Triggers `tel:+923182228891` / copies number with toast
    5. **`📍 ISB / KHI · Remote`** → Informational location badge
* **Vertical Library List (7 Items with `48px × 48px` `#radius-1` `4px` Cover Thumbnails):**
  1. **💜 Your Recruiter Mix** *(Pinned at Top — modeled on `Liked Songs`, `#E57BA1` Pink Moon accent)*
     * Subtitle (`12px` `Body/B-4` `#a9a9a9`): `📌 Pinned • [N] items bookmarked` (updates live as the recruiter clicks `+` across the site).
  2. **🔥 Featured Projects** *(Decorative `#EB5640` Red Red Wine cover)*
     * Subtitle: `Playlist • 8 systems (LPs, EPs & FYP)`
  3. **💼 Work Experience** *(Decorative `#649AED` Blue Moon cover)*
     * Subtitle: `Playlist • 4 roles (Horquva, BizBuddy, Entropik, Arch)`
  4. **🎓 Education** *(Decorative `#A7C2D1` Whiter Shade of Pale cover)*
     * Subtitle: `Playlist • NUST (3.59 CGPA), Cedar, Beaconhouse`
  5. **📄 Research & Publications** *(Decorative `#D5F479` Evergreen cover)*
     * Subtitle: `Single • Beyond-5G RIS Secrecy (IJRASET '25)`
  6. **🤝 Volunteering & Leadership** *(Decorative `#F7CFD4` Pretty in Pink cover)*
     * Subtitle: `Playlist • Software Society, DevCon '25, Bryt, WWF`
  7. **🏆 Certifications & Honors** *(Decorative `#F6C874` Mellow Yellow cover)*
     * Subtitle: `Playlist • 1st Place Hackathon, NTF 100% Scholar, DeepLearning.AI, IBM`

### 3.3 Zone 3: Center Main Stage (5 Dynamic Views)

#### View A: Candidate Home Profile (`image_d96b7d.jpg` & `image_d90de2.jpg`)

1. **Hero Banner (`1335 × 256` Album Cover Shell, Dynamic Gradient `--banner-gradient`):**
   * **Left:** Circular high-contrast portrait of Muhammad Ibrahim Shaikh (`192px × 192px`, `border-radius: 999px` `#radius-full`, drop shadow).
   * **Right:**
     * Micro-label (`12px` `Body/B-4` Bold): `Verified Engineer Profile` (with `#1fc16b` `success/200` verified badge).
     * Display Name (`Headings/H-2` `82px / 123px · Black` or `Headings/H-3` `68px / 102px · Black`): **`Muhammad Ibrahim Shaikh`** (or `ibrahimm` with full name subtitle).
     * Metadata Stats Line (`Body/B-3` `14px / 21px`, `#ffffff` / `#a9a9a9`): **`AI & Product Engineer • 8+ Production Systems • NUST '27 (3.59 CGPA) • 1x Hackathon Winner • Islamabad / Karachi (Remote)`**
2. **Profile Action Bar (Directly Below Banner, `gap: 24px` `#spacing-6`):**
   * **Primary Button (`167px × 35px`, `border-radius: 999px`, `background: #1ed760` `green/600`, `color: #121212`, `14px` Bold):** **`📅 Book a Call`** (opens Google Meet booking modal/link).
   * **Secondary Button (`167px × 35px`, `border-radius: 999px`, `background: transparent`, `color: #ffffff`, `border: 1px solid rgba(255,255,255,0.50)` `Grey 6`, `14px` Bold):** **`⬇ Download Resume`** (downloads canonical PDF resume).
   * **Settings Gear Icon (`⚙`):** Opens the **5-Color Accent Theme Switcher** popover (*Spotify Green `#1ed760`, Electric Purple `#8B5CF6`, Cyber Orange `#FF6B00`, Crimson Red `#fb3748`, Ocean Blue `#649AED`*).
3. **Quick-Access Pinned Strip (Optional 2-Column Row of `395 × 55` Horizontal Compact Cards):**
   * Uses the canonical `395px × 55px` (`border-radius: 4px`, `background: rgba(255,255,255,0.08)` `Grey 1`, `55 × 55` flush left cover) component to highlight **`Featured Projects`**, **`Work Experience`**, **`Konvex (FYP)`**, and **`Your Recruiter Mix`**.
4. **Section 1: `"Top artists this month"` → `"Top Core Technologies"` (`05 · Artwork → Artists`)**
   * Section Header: `Headings/H-9` (`22px / 33px · Black`), Sub-label: `Body/B-3` (`14px / 21px`, `#a9a9a9`) `"Core engineering stack powering production systems"`.
   * 8 circular avatar tiles (`aspect-ratio: 1`, `border-radius: 999px` `#radius-full`, `padding: 12px`, `font-weight: 900`, `font-size: 20px` + subtitle `"Core Technology"` in `14px` `#a9a9a9`). **Non-clickable** per specification:
     1. *Python* (`#649AED` Blue Moon)
     2. *LangChain & LangGraph* (`#D5F479` Evergreen)
     3. *PyTorch & Computer Vision* (`#EB5640` Red Red Wine)
     4. *n8n Automation* (`#57B660` Green alt)
     5. *RAG & Vector DBs* (`#F4E357` Yellow Submarine)
     6. *FastAPI & Next.js* (`#F6C874` Mellow Yellow)
     7. *LLMs & Multimodal AI* (`#E57BA1` Pink Moon)
     8. *PostgreSQL & AWS* (`#A7C2D1` Whiter Shade of Pale)
5. **Section 2: `"Public Playlists"` → `"Portfolio Discography & Career Sections"` (`04 · Components → Cards`)**
   * Section Header: `Headings/H-9` (`22px / 33px · Black`).
   * A grid of canonical **Vertical Playlist Cards (`width: 180px`, `height: 231px`, `padding: 16px`, `border-radius: 8px` `#radius-2`, `background: rgba(255,255,255,0.04)` `Grey 0`)**, each housing a `148px × 148px` (`border-radius: 8px`, `margin-bottom: 12px`) decorative artwork cover, hover green Play button (`#1ed760`), `16px` bold `#ffffff` title, and `14px` `#a9a9a9` description:
     * **Featured Projects** (*8 Systems · LPs, EPs & FYP*)
     * **Work Experience** (*4 Roles · Horquva, BizBuddy, Entropik, Arch*)
     * **Education** (*3 Institutions · NUST 3.59 CGPA*)
     * **Research & Publications** (*1 Paper · IJRASET '25*)
     * **Volunteering & Leadership** (*4 Roles · Software Society, DevCon, Bryt, WWF*)
     * **Certifications & Honors** (*7 Awards · 1st Place Hackathon, NTF*)
     * **Your Recruiter Mix** (*Dynamic Bookmarked Count*)

#### View B: Standard Playlist Table View (`image_d8f813.jpg` & `image_d8f3f8.jpg`)

Triggered when clicking any Playlist in the Left Sidebar or on the Home Profile:

1. **Playlist Header Banner (`1335 × 256` Shell):**
   * Square Playlist Cover Art (`200px × 200px`, `border-radius: 4px` `#radius-1`), `Public Portfolio Playlist` micro-label (`12px` Bold), large Playlist Title (`Headings/H-3` `68px / 102px · Black`), and metadata line (`14px` `Body/B-3`: `Muhammad Ibrahim Shaikh • [N] items • Updated Oct 2026`).
2. **Playlist Action Bar:**
   * **Green Play Button (`56px` circle, `#1ed760` `green/600`):** Loads Track #1 into the Right Sidebar and starts the bottom highlight timer.
   * **Shuffle Icon:** Picks a random track in the playlist.
   * **Download Arrow Icon (`⬇`):** Triggers immediate download of the Resume PDF (`Tooltip: "Download Resume PDF"`).
   * **Invite Collaborator Icon (`Person+`):** Opens the `Send Mix & Book Call` modal (`Tooltip: "Book a Call on Google Meet"`).
   * **`✎ Send Mix & Book Call` Secondary Pill Button (`height: 35px`, `border-radius: 999px`, `border: 1px solid rgba(255,255,255,0.50)`):** Rendered prominently below the action bar (modeled on the `✎ Name & details` pill in `image_d8f813.jpg`). Note: No category filter toggles are rendered here.
3. **Song List Table (`04 · Components → Song list`, Row Dimensions `1213 × 45`):**
   * Vertical stack with `gap: 4px` (`#spacing-1`).
   * Each row is `height: 45px`, `padding: 0 16px` (`#spacing-4`), `gap: 16px` (`#spacing-4`), `border-radius: 4px` (`#radius-1`), `font-size: 14px` (`Body/B-3`):
     * **Column 1 (Index):** `width: 24px`, `color: #a9a9a9` (`dark/300`).
     * **Column 2 (Thumbnail):** `width: 32px`, `height: 32px`, `border-radius: 4px` (`#radius-1`), default placeholder `#535353` (`dark/700`) or decorative project icon.
     * **Column 3 (Track Title & Artist/Subtitle):** `flex: 1`. Line 1: Track Title (`14px` `Body/B-3` Bold; `#ffffff` in default state, `#1ed760` `green/600` or `var(--accent-primary)` when active/selected). Line 2: Subtitle/Tech Stack (`12px` `Body/B-4`, `color: #a9a9a9`).
     * **Column 4 (Album / Organization / Timeline Metadata):** `width: 260px`, `color: #a9a9a9` (`14px` `Body/B-3`).
     * **Column 5 (Bookmark `+` & Duration/Domain Tag):** `+` icon to toggle **Your Recruiter Mix** + right-aligned tag (`color: #a9a9a9`, `14px` `Body/B-3`, e.g., `3.59 CGPA`, `Remote`, `Agentic AI`).
   * **Active / Hover State:** Row background transitions from `transparent` to `rgba(255, 255, 255, 0.08)` (`Grey 1`).

#### View C: The "Send Mix & Book Call" Modal (`image_d8077c.jpg`)

Triggered by clicking `✎ Send Mix & Book Call` inside `Your Recruiter Mix` or the `Person+` button:

* **Modal Container:** `background: #282828` (`dark/900`), `border-radius: 12px` (`#radius-3`), `padding: 24px` (`#spacing-6`).
* **Modal Header:** `"Send Recruiter Mix & Book a Call"` (`Headings/H-9` `22px / 33px · Black`) + `×` close button.
* **Left Column (`180px` wide):**
  * Square cover art for `Your Recruiter Mix` (`180px × 180px`, `border-radius: 4px` `#radius-1`, `#E57BA1` Pink Moon).
  * Directly beneath the cover art (replacing Spotify's `🔒 Make private` pill): **`📅 Schedule on Google Meet`** primary pill button (`height: 35px`, `border-radius: 999px`, `background: #1ed760`, `color: #121212`, `14px` Bold).
* **Right Column (`280px` wide):**
  * **Top Input Field:** Recruiter's `Name, Company & Email` (`background: rgba(255,255,255,0.12)` `Grey 2`, `border-radius: 4px`, `color: #ffffff`, placeholder `#a9a9a9`).
  * **Bottom Textarea (`height: 120px`):** Pre-populated with:
    `"Hi Ibrahim, I checked out your portfolio and bookmarked the following in my Recruiter Mix: [List of Liked Projects/Roles/Skills]. Let's connect!"`
  * **Bottom-Right Action Button (`Send & Book`):** `height: 35px`, `border-radius: 999px`, `background: #ffffff` (`neutral/100`), `color: #121212` (`dark/1000`), `font-weight: 700`. Emails the payload to `m.ibrahimshaikh357@gmail.com` and opens the Google Calendar Appointment Booking page in a new tab.

#### View D: Recommender Profile Screen (When Clicking Dr. Saeed Murtaza or Khawir Mahmood in `Listening Activity`)

Modeled directly on the Spotify User Profile layout (`image_d7ace6.jpg`) using the `1335 × 256` Banner shell and `05 · Artwork` circular & square tiles so it works identically for both **Academic Professors** and **Industry Managers/Founders**:

1. **Top Profile Banner (`1335 × 256` Shell):**
   * Circular Portrait of the Recommender on the left (`200px × 200px`, `border-radius: 999px` `#radius-full`).
   * Verification Badge (`12px` Bold): `🎓 Verified Academic Endorsement` (or `🏢 Verified Industry Endorsement`).
   * Display Title (`Headings/H-4` `56px / 84px · Black`): **`Dr. Saeed Murtaza`** or **`Asst. Prof. Khawir Mahmood`**.
   * Metadata Line (`Body/B-3` `14px / 21px`, `#a9a9a9`):
     * *For Dr. Saeed Murtaza:* `Associate Professor @ MCS NUST • Ph.D. University of Birmingham (UK) • Ranks Ibrahim in Top 5%`
     * *For Asst. Prof. Khawir Mahmood:* `Assistant Professor & FYP Supervisor @ MCS NUST • ML/DL & OOP Instructor • Ranks Ibrahim in Top 5%`
2. **Profile Action Row (`gap: 16px`):**
   * **Primary Button (`height: 35px`, `border-radius: 999px`, `#1ed760`):** **`Open Google Scholar Profile ↗`** (links to [Dr. Saeed Murtaza's Scholar](https://scholar.google.com/citations?user=hveYKTcAAAAJ&hl=en) or [Khawir Mahmood's Scholar](https://scholar.google.com/citations?user=wixHCFkAAAAJ&hl=en); for Industry recommenders, reads **`Open LinkedIn Profile ↗`**).
   * **Secondary Button (`height: 35px`, `border-radius: 999px`, `border: 1px solid rgba(255,255,255,0.50)`):** **`📄 Read Full Signed Letter in Sidebar`** (loads the verbatim signed recommendation letter into the Right Sidebar or expands inline).
3. **Section 1: `"Top artists this month"` → `"Endorsed Competencies & Courses"` (`05 · Artwork → Artists` Circular Tiles):**
   * *Dr. Saeed Murtaza's 5 Circular Badges (`border-radius: 999px`, `aspect-ratio: 1`):* **Linear Algebra & ODEs** (`#649AED`), **Probability & Statistics** (`#D5F479`), **Complex Variables** (`#F6C874`), **First-Principles Math-to-Code** (`#EB5640`), **Research & Team Leadership** (`#A7C2D1`).
   * *Asst. Prof. Khawir Mahmood's 6 Circular Badges (`border-radius: 999px`, `aspect-ratio: 1`):* **Machine Learning (Grade: A)** (`#D5F479`), **Deep Learning Diagnostics** (`#EB5640`), **Object-Oriented Programming** (`#649AED`), **Agentic Safety Boundaries** (`#F6C874`), **FYP Research Autonomy** (`#E57BA1`), **Empirical Code Hygiene** (`#57B660`).
4. **Section 2: `"Public Playlists"` → `"Endorsement Letter Highlights & Linked Work"`:**
   * **Left Column (Editorial Endorsement Card, `background: rgba(255,255,255,0.04)` `Grey 0`, `border-radius: 8px` `#radius-2`, `padding: 24px`):** Displays the verbatim paragraphs of their recommendation letter in `Body/B-2` (`16px / 24px`) along with their digitized signature block and [NUST MCS Faculty affiliation](https://mcs.nust.edu.pk/faculty/saeed-murtaza/).
   * **Right Column (Linked Portfolio Cards, `180 × 231` Vertical Cards):** Clickable cards for **`Bachelor of Software Engineering — NUST`** and **`Konvex — AI-Native E-Commerce Assistant (FYP)`** so the recruiter can jump straight from the professor's endorsement to the actual project or degree track.

#### View E: Lyrics Mode Easter Egg — Personal Cover Letter (`image_d90a06.png`)

Triggered by clicking the **Microphone (`🎤`)** icon in the bottom-right player bar:

* Full-stage warm charcoal backdrop (`#333333` `neutral/1000` or dynamic dark tint).
* Renders a personal, non-corporate cover letter / self-introduction (initialized with structured *Lorem Ipsum* stanzas ready for Muhammad Ibrahim Shaikh's personal text).
* Typography uses **`Headings/H-7` (`32px / 48px · Black`)**: as the bottom progress bar advances, the active stanza highlights in crisp bright white (`#ffffff` `neutral/100`) while preceding and upcoming stanzas remain softly dimmed (`rgba(255,255,255,0.40)` `Grey 5`), scrolling smoothly into the vertical center of the stage. Clicking any stanza jumps the progress bar directly to that paragraph.

### 3.4 Zone 4: Right Contextual Sidebar (`Main card: 442 × 528` Shell) (`image_d97052.jpg`, `image_d96ff6.png`, `image_d8f3f8.jpg`, `image_d80f34.jpg`)

#### Mode A: `Now Playing` Track Inspector (Default Mode)

Displays 5 stacked cards (`background: rgba(255,255,255,0.04)` `Grey 0`, `border-radius: 8px` `#radius-2`, `padding: 16px` `#spacing-4`, `margin-bottom: 12px` `#spacing-3`) inside the `#121212` (`dark/1000`) right panel that adapt dynamically to whichever Track (Project, Work Experience, Education, Publication, or Leadership role) is currently selected:

1. **Top Header & Square Cover Art (`200px × 200px` to `280px × 280px`, `border-radius: 4px` `#radius-1`):**
   * Header shows parent Playlist name (`14px` `Body/B-3` Bold `#ffffff`, e.g., `Featured Projects`) + Close `×` icon (`#a9a9a9`).
   * Below cover art: Track Title (`Headings/H-8` `26px / 39px · Black` or `Headings/H-9` `22px / 33px · Black`), Subtitle (`14px` `Body/B-3` `#a9a9a9`), Share icon, and `+` button to add to **Your Recruiter Mix**.
2. **Card 1: `Lyrics preview` (Decorative Metric Highlight Card):**
   * Styled like the crimson `Lyrics preview` card in `image_d8f3f8.jpg` using `#EB5640` (`Red Red Wine`) or the active track's decorative color (`border-radius: 8px` `#radius-2`, `padding: 16px`), displaying the 2-line quantitative headline hook of the selected item in `Body/B-2` Bold (`16px / 24px`, e.g., *"89% LLM Cost Reduction • 157,000+ Messages Processed Across 25+ Restaurants"*).
3. **Card 2: `About the Project` / `About the Role` / `About the Program`:**
   * Banner visual at top of card with overlay label (`About the Project`, `16px` Bold).
   * Headline metric in the `"monthly listeners"` slot (`Body/B-2` Bold `#ffffff`) + **`Live Demo ↗`** Secondary Button (`height: 35px`, `border-radius: 999px`, `border: 1px solid rgba(255,255,255,0.50)`) in the `"Follow"` slot (when a live URL exists, such as [Medical Report Analyzer](https://medical-report-analyzer-pi.vercel.app/)).
   * Full bulleted engineering breakdown below in `Body/B-3` (`14px / 21px`, `#a9a9a9`).
4. **Card 3: `Credits` (`Show all`):**
   * Header: `Credits` (`Headings/H-9` `22px / 33px · Black` or `16px` Bold) + `Show all` (`14px` `#a9a9a9`).
   * Lists each technology, framework, or university course associated with that track:
     * **Line 1 (`14px` `Body/B-3` Bold `#ffffff`):** Technology / Course Name (e.g., `LangGraph`, `YOLOv8`, `Qwen 3.6 Flash`).
     * **Line 2 (`12px` `Body/B-4` `#a9a9a9`):** Specific Architectural Role (e.g., `6-Node State Graph`, `Thoracic Vision Engine`, `Production LLM Migration`).
5. **Card 4: `Next in queue`:**
   * Header: `Next in queue` (`16px` Bold `#ffffff`) + **`Open GitHub Repo ↗`** action link (`14px` Bold `#a9a9a9`).
   * Displays a clickable `45px` row linking directly to the item's GitHub repository (e.g., [github.com/mibrahimm1/sonyc\_rag](https://www.google.com/search?q=https://github.com/mibrahimm1/sonyc_rag)) or [Beyond-5G RIS DOI](https://www.google.com/search?q=https://doi.org/10.22214/ijraset.2025.66898), plus a one-click button to advance to the next track in the playlist.

#### Mode B: `Listening activity` Sidebar (Toggled via Top-Right Friends Icon `👥`)

Modeled 1:1 on `image_d80f34.jpg`:

* **Header:** `Listening activity` (`16px` `Body/B-2` Bold `#ffffff`) + `×` close button (`#a9a9a9`).
* **Row 1 — Dr. Saeed Murtaza (`padding: 12px`, `border-radius: 8px`, hover `rgba(255,255,255,0.08)` `Grey 1`):**
  * **Avatar:** `40px × 40px` (`border-radius: 999px`) circular faculty avatar with academic badge.
  * **Line 1 (`14px` `Body/B-3` Bold `#ffffff`):** [**Dr. Saeed Murtaza**](https://scholar.google.com/citations?user=hveYKTcAAAAJ&hl=en) *(Clicking external icon opens Google Scholar; clicking row opens his Recommender Profile in Zone 3)* · `Top 5%`
  * **Line 2 (`12px` `Body/B-4` `#a9a9a9`):** `Associate Professor • MCS NUST (Ph.D. Birmingham)`
  * **Line 3 (`12px` `Body/B-4` `#a9a9a9` Clickable Track Link):** `💿 Bachelor of Software Engineering — NUST` *(Clicking loads NUST Education track)*
* **Row 2 — Asst. Prof. Khawir Mahmood (`padding: 12px`, `border-radius: 8px`, hover `rgba(255,255,255,0.08)` `Grey 1`):**
  * **Avatar:** `40px × 40px` (`border-radius: 999px`) circular faculty avatar with academic badge.
  * **Line 1 (`14px` `Body/B-3` Bold `#ffffff`):** [**Asst. Prof. Khawir Mahmood**](https://scholar.google.com/citations?user=wixHCFkAAAAJ&hl=en) *(Clicking external icon opens Google Scholar; clicking row opens his Recommender Profile in Zone 3)* · `Top 5%`
  * **Line 2 (`12px` `Body/B-4` `#a9a9a9`):** `Assistant Professor & FYP Supervisor • MCS NUST`
  * **Line 3 (`12px` `Body/B-4` `#a9a9a9` Clickable Track Link):** `🎵 Konvex — AI-Native E-Commerce Assistant` *(Clicking loads Konvex track)*

### 3.5 Zone 5: Persistent Bottom Control Bar (`1408 × 77` Shell) (`04 · Components → Bottom control`, `image_d96b7d.jpg` & `image_d90a06.png`)

Anchored to the bottom of the viewport (`height: 77px`, `background: #000000`, `border-top: 1px solid rgba(255, 255, 255, 0.12)` `Grey 2`, `padding: 0 16px` `#spacing-4`, `display: flex`, `align-items: center`, `justify-content: space-between`):

* **Left Cluster (`width: 300px`, `display: flex`, `gap: 12px` `#spacing-3`, `align-items: center`):**
  * **Active Track Artwork:** `56px × 56px`, `border-radius: 4px` (`#radius-1`), default fill `#535353` (`dark/700`) or decorative project cover.
  * **Track Metadata Stack:**
    * Line 1: Track Title (`14px` `Body/B-3`, `font-weight: 700`, `color: #ffffff`).
    * Line 2: Artist / Organization Subtitle (`12px` `Body/B-4`, `color: #a9a9a9` `dark/300`).
  * **Add to Recruiter Mix Button (`+` / Heart):** Toggles inclusion in `Your Recruiter Mix`.
* **Center Cluster (`width: 480px`):**
  * **Top Transport Row (`margin-bottom: 8px` `#spacing-2`, `display: flex`, `justify-content: center`, `align-items: center`, `gap: 16px`):**
    * Shuffle (`#a9a9a9`), Previous Track (`⏮`), **Play / Pause Toggle Button (`width: 32px`, `height: 32px`, `border-radius: 999px` `#radius-full`, `background: #ffffff` `neutral/100`, `color: #121212` `dark/1000`, `16 × 16` Play `M7 4v16l13-8z` or Pause `M6 4h4v16H6zM14 4h4v16h-4z` SVG)**, Next Track (`⏭`), Repeat.
  * **Bottom Progress Scrubber (`height: 4px`, `border-radius: 999px` `#radius-full`, `background: rgba(255, 255, 255, 0.30)` `Grey 4`):**
    * **Active Fill Bar:** `height: 4px`, `border-radius: 999px` (`#radius-full`), `background: #1ed760` (`green/600` or `var(--accent-primary)`).
    * **Behavior:** Gently auto-advances on a silent visual timer (`Property 1=play` / `Property 1=pause`), cycling through the active track's highlights and advancing to the next track when complete.
* **Right Cluster (`width: 300px`, `display: flex`, `justify-content: flex-end`, `align-items: center`, `gap: 16px`):**
  * **Microphone Icon (`🎤 Lyrics`):** Features a subtle pulsing `#1ed760` accent dot and tooltip (`"Easter Egg: Personal Cover Letter"`). Clicking toggles Zone 3 into **Lyrics Mode (`image_d90a06.png`)**.
  * **Queue Icon:** Focuses the Right Sidebar `Next in queue` section.
  * **GitHub / Live Link Quick Icon:** Opens the active track's primary external link.
  * **Decorative Volume-Style Bar:** `height: 4px`, `width: 96px`, `border-radius: 999px`, `background: rgba(255, 255, 255, 0.30)` (`Grey 4`) with `#1ed760` fill (purely visual since ambient audio is omitted).