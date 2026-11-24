# Software Requirements Specification (SRS)
**Project:** Muhammad Ibrahim Shaikh — Spotify Desktop Portfolio & Conversational AI Platform  
**Standard Compliance:** ISO/IEC/IEEE 29148:2018 (Clause 9.5 SRS Structure & Normative Grammar)  
**Document Version:** 1.0  
**Date:** October 29, 2026  

## 1. Introduction Defines System Scope, Purpose, and Normative Conventions

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, non-functional, interface, and verification requirements for Muhammad Ibrahim Shaikh's Spotify-themed Desktop Portfolio Web Application. Every normative requirement statement in Section 4 and Section 5 adheres to ISO/IEC/IEEE 29148:2018 Clause 5.2.4 sentence grammar (`[Condition/Trigger] [Subject] SHALL [Action Verb] [Object] [Performance Constraint / Threshold]`) and Clause 5.2.5 quality attributes (Necessary, Implementation-Free, Unambiguous, Consistent, Complete, Singular, Feasible, Traceable, and Verifiable).

### 1.2 Scope
The software system ("The Portfolio System") is a desktop-first interactive web application that emulates the layout, visual hierarchy, and interaction model of the Spotify Desktop Client to showcase Muhammad Ibrahim Shaikh's engineering projects, work experience, education, research publications, leadership roles, certifications, faculty/industry endorsements, and a first-person conversational AI assistant. Mobile application emulation is explicitly out of scope for Phase 1.

### 1.3 Normative Terminology
- **SHALL**: Indicates a mandatory, binding requirement that must be implemented and verified.
- **SHOULD**: Indicates a strongly recommended design goal.
- **MAY**: Indicates an optional or permissible capability.

## 2. Product Overview Establishes Context, User Classes, and Constraints

### 2.1 Product Perspective
The Portfolio System operates as a standalone client-side single-page web application (SPA) integrated with:
1. An asynchronous **Conversational AI Inference Endpoint** powering the top-bar Search Chatbot.
2. An **Transactional Email / Webhook Dispatch Service** delivering curated "Recruiter Mix" submissions to `m.ibrahimshaikh357@gmail.com`.
3. External deep links to [GitHub](https://github.com/mibrahimm1), [LinkedIn](https://www.linkedin.com/in/ibrahimshaikhh/), [Google Scholar](https://scholar.google.com/citations?user=hveYKTcAAAAJ&hl=en), [DOI Registry](https://www.google.com/search?q=https://doi.org/10.22214/ijraset.2025.66898), [Live Project Deployments](https://medical-report-analyzer-pi.vercel.app/), and [Google Calendar Appointment Scheduling](https://calendar.google.com/).

### 2.2 User Classes and Characteristics
| User Class | Primary Goals | Key System Features Used |
| :--- | :--- | :--- |
| **Technical Recruiter** | Rapidly verify candidate GPA (`3.59/4.0`), core stack, production experience, resume PDF, and interview availability within 60–120 seconds. | Home Profile, Left Sidebar Contact Pills, Playlist Views, Resume Download, Recruiter Escape Hatch (`-`), `Your Recruiter Mix` + Google Meet Booking Modal. |
| **Startup Founder / Engineering Hiring Manager** | Evaluate architectural rigor, LLM/RAG cost-optimization metrics, code quality, and faculty/industry credibility. | Right-Hand `Now Playing` Project Inspector, GitHub `Next in queue` links, AI Search Chatbot, `Listening activity` Recommender Profiles. |

### 2.3 Design and Implementation Constraints
- **CON-01 (Desktop-Only Phase 1 Scope):** The system targets desktop viewports (`>= 1024px` width); mobile app layout emulation is excluded from Phase 1.
- **CON-02 (No Audio Playback):** The system excludes actual ambient audio playback; playback controls operate purely visual timers and state transitions.
- **CON-03 (Content Sanitization):** The system dataset excludes all references to Aveniq Labs and LaborIQ.
- **CON-04 (No Sub-Playlist Filter Pills):** Playlist table views exclude category filter toggle pills above the track table.

## 3. External Interface Requirements Specify UI, API, and Hardware Boundaries

### 3.1 User Interfaces (UI-01 to UI-06)
- **UI-01 (5-Zone Desktop Shell):** The viewport layout consists of five persistent structural zones:
  1. **Top Navigation & Search Bar** (`height: 64px`)
  2. **Left Library Sidebar** (`width: 280px–340px`, resizable/collapsible)
  3. **Center Main Stage** (`flex: 1`, scrollable container with dynamic header gradient)
  4. **Right Contextual Sidebar** (`width: 300px–360px`, toggling between `Now Playing Inspector` and `Listening activity`)
  5. **Bottom Player & Scrubber Bar** (`height: 88px`)
- **UI-02 (Modal & Popover Overlays):** The system renders two overlay layers above the 5-zone shell:
  1. **AI Search Dropdown Popover** anchored directly beneath the top center search input (`width: 480px–560px`, `max-height: 520px`).
  2. **Send Mix & Book Call Modal** (`Edit details` dialog, `width: 524px`) centered over a dimmed backdrop (`rgba(0,0,0,0.7)`).

### 3.2 Software & External Service Interfaces
- **SI-01 (Email Notification Service):** Accepts JSON payloads containing recruiter name, email/organization, custom notes, and an array of bookmarked track IDs, dispatching an email to `m.ibrahimshaikh357@gmail.com`.
- **SI-02 (Google Calendar Appointment Interface):** Opens the candidate's configured Google Calendar Appointment Schedule URL in a new browser tab (`target="_blank"`, `rel="noopener noreferrer"`).
- **SI-03 (AI Chat Interface):** Accepts natural-language query strings from the top search bar and streams or returns first-person responses grounded in Muhammad Ibrahim Shaikh's portfolio data.

## 4. System Features and Functional Requirements (ISO/IEC/IEEE 29148:2018 Compliant)

### 4.1 Global Navigation Bar & Escape Hatch (FR-NAV)
- **FR-NAV-01:** When a user clicks the top-bar Home button (`🏠`), the Portfolio System SHALL render the Candidate Home Profile view inside the Center Main Stage within `100ms`.
- **FR-NAV-02:** When a user clicks the top-bar Back (`<`) or Forward (`>`) navigation buttons, the Portfolio System SHALL transition the Center Main Stage to the previous or next view in the session history stack within `100ms`.
- **FR-NAV-03:** When a user hovers over the top-right window minimize button (`-`), the Portfolio System SHALL display a tooltip labeled `"Switch to Standard Resume View"` within `150ms`.
- **FR-NAV-04:** When a user clicks the top-right window minimize button (`-`), the Portfolio System SHALL navigate the viewport to the separate Standard Resume UI route within `300ms`.
- **FR-NAV-05:** When a user clicks the top-right Bell icon (`🔔`), the Portfolio System SHALL maintain the current application state without opening a popover or triggering navigation.
- **FR-NAV-06:** When a user clicks the top-right Friends Activity icon (`👥`), the Portfolio System SHALL toggle the Right Contextual Sidebar to display the `Listening activity` endorsements panel within `150ms`.

### 4.2 AI Search Bar & Conversational Dropdown (FR-CHAT)
- **FR-CHAT-01:** When a user clicks the top search input (`"What do you want to play?"`) or presses `Ctrl+L` / `Cmd+K`, the Portfolio System SHALL open the AI Search Dropdown Popover directly below the search input within `100ms`.
- **FR-CHAT-02:** When the AI Search Dropdown Popover opens with an empty conversation thread, the Portfolio System SHALL display a `"Recent searches"` list containing 5 clickable starter prompt items within the popover.
- **FR-CHAT-03:** When a user clicks a starter prompt item or submits a text query in the search input, the Portfolio System SHALL append the user message to the dropdown chat thread and render a first-person AI response styled in Spotify dark-mode typography.
- **FR-CHAT-04:** When a user clicks outside the AI Search Dropdown Popover or presses the `Escape` key, the Portfolio System SHALL close the popover while preserving the conversation history in session state.

### 4.3 Left Sidebar: Contact Filter Pills, Library & Recruiter Mix (FR-LIB)
- **FR-LIB-01:** The Portfolio System SHALL render interactive filter pills at the top of the Left Sidebar providing direct external links to [GitHub](https://github.com/mibrahimm1), [LinkedIn](https://www.linkedin.com/in/ibrahimshaikhh/), [Email](mailto:m.ibrahimshaikh357@gmail.com), Phone (`tel:+923182228891`), and Location info (`Islamabad / Karachi · Open to Remote`).
- **FR-LIB-02:** The Portfolio System SHALL pin the `"Your Recruiter Mix"` (`Liked Songs`) playlist as the first item in the Left Sidebar library list with a live numeric badge displaying the total count of bookmarked items.
- **FR-LIB-03:** The Portfolio System SHALL render six category playlists in the Left Sidebar library list: *Featured Projects*, *Work Experience*, *Education*, *Research & Publications*, *Volunteering & Leadership*, and *Courses, Certifications & Honors*.
- **FR-LIB-04:** When a user clicks any playlist item in the Left Sidebar, the Portfolio System SHALL render that playlist's header banner, action bar, and track table inside the Center Main Stage within `150ms`.

### 4.4 Center Stage: Home Profile, Theme Switcher & Playlist Views (FR-STAGE)
- **FR-STAGE-01:** On initial application load, the Portfolio System SHALL render the Candidate Home Profile in the Center Main Stage displaying the name `"Muhammad Ibrahim Shaikh"`, the tagline `"AI & Product Engineer • 8+ Production Systems • NUST '27 • 1x Hackathon Winner"`, primary CTA buttons (`Book a Call` and `Download Resume`), the 8 circular `"Top artists this month"` technology avatars, and the grid of `"Public Playlists"` square cards.
- **FR-STAGE-02:** When a user clicks any of the 8 circular `"Top artists this month"` technology avatars on the Home Profile, the Portfolio System SHALL perform no navigation or state mutation.
- **FR-STAGE-03:** When a user clicks the Settings Gear icon (`⚙`) on the Home Profile action bar, the Portfolio System SHALL open a theme selector menu allowing selection among five accent colors: Spotify Green (`#1DB954`), Electric Purple (`#8B5CF6`), Cyber Orange (`#FF6B00`), Crimson Red (`#E11D48`), and Ocean Blue (`#0EA5E9`).
- **FR-STAGE-04:** When a user selects an accent color from the Settings Gear menu, the Portfolio System SHALL update the global CSS primary accent variable (`--accent-primary`) across all active buttons, badges, scrubbers, and highlights within `50ms`.
- **FR-STAGE-05:** When a user opens a Playlist View in the Center Main Stage, the Portfolio System SHALL render a 4-column track table (`# & Title`, `Album`, `Date added`, and `⏱ Duration/Metadata`) without rendering category filter toggle pills above the table.
- **FR-STAGE-06:** When a user clicks the green **Play** button in a Playlist Action Bar, the Portfolio System SHALL load Track #1 of that playlist into the Right Contextual Sidebar and start the bottom-bar highlight progression timer.
- **FR-STAGE-07:** When a user clicks the **Download Arrow** button in a Playlist Action Bar, the Portfolio System SHALL initiate a browser download of Muhammad Ibrahim Shaikh's canonical PDF resume within `200ms`.
- **FR-STAGE-08:** When a user clicks the **Invite Collaborator (`Person+`)** button in a Playlist Action Bar, the Portfolio System SHALL open the `Send Mix & Book Call` modal within `150ms`.

### 4.5 Bookmarking (`+` / Heart) & The "Send Mix & Book Call" Modal (FR-MIX)
- **FR-MIX-01:** When a user clicks the `+` / Checkmark button on any track row, Right Sidebar header, or bottom player bar, the Portfolio System SHALL toggle that item's presence in the `"Your Recruiter Mix"` state array and update the Left Sidebar badge count within `50ms`.
- **FR-MIX-02:** When a user opens the `"Your Recruiter Mix"` playlist and clicks the **`✎ Send Mix & Book Call`** pill button (modeled on Spotify's `Edit details` pill), the Portfolio System SHALL display the centered `Send Mix & Book Call` modal.
- **FR-MIX-03:** Inside the `Send Mix & Book Call` modal, the Portfolio System SHALL pre-populate the multi-line description textarea with a formatted summary of all tracks currently stored in `"Your Recruiter Mix"`.
- **FR-MIX-04:** When a user clicks the **`Schedule on Google Meet`** pill button beneath the modal cover art or clicks the primary **`Send & Book`** button with a valid email input, the Portfolio System SHALL dispatch the form payload to `m.ibrahimshaikh357@gmail.com` and open the Google Calendar Appointment Booking URL in a new browser tab.

### 4.6 Right Contextual Sidebar: "Now Playing" Track Inspector (FR-INSP)
- **FR-INSP-01:** When a user clicks any track row in a Playlist table, the Portfolio System SHALL highlight the selected track row in the active accent color and open the Right Contextual Sidebar in `Now Playing Inspector` mode within `100ms`.
- **FR-INSP-02:** In `Now Playing Inspector` mode, the Portfolio System SHALL render five vertical cards in order:
  1. **Track Art & Header Card** (Cover image, track title, subtitle, and `+` bookmark button)
  2. **Headline Hook Card** (`Lyrics preview` colored card displaying key quantitative impact metrics)
  3. **Detailed Narrative Card** (`About the Project` / `About the Role` / `About the Program` with full bullet points and a `Live Demo` button where applicable)
  4. **Credits Card** (`Credits` listing technologies used and their architectural roles, or relevant coursework for Education tracks)
  5. **Next in Queue Card** (`Next in queue` providing a direct external hyperlink to the project's GitHub repository or publication DOI, plus a button to advance to the next track)

### 4.7 Right Contextual Sidebar: `Listening Activity` & Recommender Profiles (FR-REC)
- **FR-REC-01:** When the Right Contextual Sidebar is in `Listening activity` mode, the Portfolio System SHALL render endorsement cards for **Dr. Saeed Murtaza** and **Asst. Prof. Khawir Mahmood** (and any future configured recommenders), displaying each person's avatar, full name, academic/industry title, and a clickable `🎵`/`💿` link to the associated portfolio track (`Bachelor of Software Engineering — NUST` or `Konvex`).
- **FR-REC-02:** When a user clicks the external profile badge next to a recommender's name in `Listening activity`, the Portfolio System SHALL open that recommender's [Google Scholar](https://scholar.google.com/citations?user=hveYKTcAAAAJ&hl=en) or LinkedIn URL in a new browser tab.
- **FR-REC-03:** When a user clicks the `🎵`/`💿` linked experience line on a `Listening activity` card, the Portfolio System SHALL navigate to the linked portfolio track and load its details into the Right Contextual Sidebar.
- **FR-REC-04:** When a user clicks a recommender's main card or name in `Listening activity`, the Portfolio System SHALL render that recommender's dedicated **Recommender Profile Screen** in the Center Main Stage (modeled on the Spotify User Profile layout), showcasing their credentials, circular endorsed-competency badges, full recommendation letter text, and linked project/education cards.

### 4.8 Bottom Player Bar, Auto-Scrubber & Lyrics Easter Egg (FR-PLAY)
- **FR-PLAY-01:** While playback state is active (`isPlaying = true`), the Portfolio System SHALL advance the bottom progress scrubber bar continuously across a `30-second` cycle per track without emitting audible sound, cycling through key bullet highlights of the active track.
- **FR-PLAY-02:** The Portfolio System SHALL render a subtle pulsing accent dot and hover tooltip (`"Read Personal Cover Letter"`) on the Microphone (`🎤 Lyrics`) icon in the bottom-right player bar.
- **FR-PLAY-03:** When a user clicks the Microphone (`🎤 Lyrics`) icon in the bottom-right player bar, the Portfolio System SHALL transition the Center Main Stage to the full-stage **Lyrics Mode Easter Egg** view and highlight the Microphone icon in the active accent color.
- **FR-PLAY-04:** While the **Lyrics Mode Easter Egg** view is active, the Portfolio System SHALL render Muhammad Ibrahim Shaikh's personal cover letter (initialized with structured *Lorem Ipsum* placeholder stanzas) in large Spotify Lyrics typography (`28px–36px` bold) and automatically scroll and highlight stanzas line-by-line in sync with the bottom progress scrubber.

## 5. Non-Functional Requirements Define Performance, Accessibility, and Reliability Targets

- **NFR-PERF-01 (Initial Load Time):** The Portfolio System SHALL achieve a First Contentful Paint (FCP) of `<= 1.2 seconds` and Time to Interactive (TTI) of `<= 2.0 seconds` on a standard desktop broadband connection (`>= 20 Mbps`).
- **NFR-PERF-02 (View Transition Latency):** The Portfolio System SHALL complete all client-side view switches (Home Profile, Playlist Table, Recommender Profile, Lyrics Mode, and Right Sidebar toggles) within `<= 150ms` at `60 FPS`.
- **NFR-A11Y-01 (Contrast Compliance):** All primary body text (`#FFFFFF`) and secondary metadata text (`#B3B3B3`) against Spotify dark surfaces (`#121212` and `#181818`) SHALL maintain a WCAG 2.1 contrast ratio of `>= 4.5:1`.
- **NFR-A11Y-02 (Keyboard Navigation):** The Portfolio System SHALL bind `Ctrl+L` / `Cmd+K` to focus the AI Search Bar, `Space` (when not focused in an input field) to toggle Play/Pause on the bottom scrubber, and `Escape` to dismiss any open modal or popover.
- **NFR-REL-01 (State Persistence):** The Portfolio System SHALL persist the visitor's `"Your Recruiter Mix"` bookmarked tracks and selected Accent Color theme in `localStorage` across page reloads.

## 6. Verification & Requirements Traceability Matrix (RTM)

Every functional and non-functional requirement maps to an ISO/IEC/IEEE 29148 Clause 6.4 verification method (**I** = Inspection, **A** = Analysis, **D** = Demonstration, **T** = Automated/Empirical Test):

| Req ID | Requirement Summary | Source Stakeholder Need | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **FR-NAV-01** | Home button resets Center Stage to Candidate Profile | Core Spotify Desktop navigation | **T / D** | Clicking `🏠` from any Playlist or Lyrics view renders Profile view in `<100ms` |
| **FR-NAV-03/04** | Minimize (`-`) tooltip & Standard Resume View switch | Recruiter Escape Hatch | **D / T** | Hover shows tooltip; click navigates to clean non-Spotify resume view |
| **FR-NAV-05** | Bell icon (`🔔`) is non-interactive | Round 5 user confirmation | **I / T** | Clicking Bell icon triggers zero DOM changes or popovers |
| **FR-NAV-06** | Friends icon (`👥`) toggles `Listening activity` sidebar | Round 4 & 5 user confirmation | **T / D** | Clicking Friends icon switches Right Sidebar between `Now Playing` and `Listening activity` |
| **FR-CHAT-01..04** | Search bar opens AI Chat Dropdown with 5 starter prompts | Round 1–3 AI Chatbot UX | **T / D** | Clicking search bar opens dropdown (`image_d968d4.jpg` layout) with starter prompts + chat thread |
| **FR-LIB-01** | Left Sidebar filter pills link to GitHub, LinkedIn, Email, Phone | Round 2 & 3 user confirmation | **I / T** | Pills link to `github.com/mibrahimm1`, `linkedin.com/in/ibrahimshaikhh`, `m.ibrahimshaikh357@gmail.com`, `0318-2228891` |
| **FR-LIB-02/03** | Pinned `Your Recruiter Mix` + 6 Resume Category Playlists | Round 1–3 Library modeling | **I / D** | All 6 playlists and `Your Recruiter Mix` counter render in Left Sidebar |
| **FR-STAGE-01/02** | Home Profile with 8 non-clickable circular Tech Avatars | Round 3 & 4 user confirmation | **I / T** | 8 circular tech avatars render under `Top artists this month`; clicking triggers no action |
| **FR-STAGE-03/04** | Settings Gear (`⚙`) switches among 5 accent themes | Round 4 user confirmation | **T / D** | Selecting Green, Purple, Orange, Crimson, or Blue updates `--accent-primary` globally |
| **FR-STAGE-05** | Playlist Table renders 4 columns with no sub-filter pills | Round 2 & 3 user confirmation | **I / T** | Table columns match `Title`, `Album`, `Date added`, `⏱` without filter pills above table |
| **FR-MIX-01..04** | `+` adds to Mix; `Send Mix & Book Call` modal emails & opens Meet | Round 1, 2 & 4 conversion flow | **T / D** | Clicking `✎ Send Mix & Book Call` opens `Edit details` modal (`image_d8077c.jpg`), emails mix, and opens Google Calendar link |
| **FR-INSP-01/02** | Clicking track opens Right Sidebar with 5 contextual cards | Round 1–3 Right Sidebar modeling | **T / D** | Right Sidebar renders Art, `Lyrics preview` hook, `About`, `Credits`, and `Next in queue` link |
| **FR-REC-01..04** | `Listening activity` features Dr. Saeed Murtaza & Khawir Mahmood + Profile View | Round 4 & 5 Recommendation Letters | **D / I** | Clicking recommender opens Recommender Profile view; clicking Scholar/Track links routes accurately |
| **FR-PLAY-01..04** | Silent auto-advancing scrubber + Mic icon Lyrics Easter Egg | Round 1, 2 & 3 Easter Egg UX | **T / D** | Scrubber advances smoothly with zero audio; clicking Mic icon auto-scrolls *Lorem Ipsum* cover letter |
| **NFR-PERF-01/02** | FCP `<= 1.2s`, view transitions `<= 150ms` | Desktop responsiveness | **A / T** | Lighthouse performance score `>= 90`; transitions measured `<150ms` |
| **NFR-REL-01** | Persist Recruiter Mix and Accent Theme in `localStorage` | Session continuity | **T** | Reloading browser retains liked tracks and chosen accent color |
