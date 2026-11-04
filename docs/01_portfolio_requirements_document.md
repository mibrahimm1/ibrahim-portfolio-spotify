# Complete Portfolio Requirements Document (PRD)
**Project Title:** Muhammad Ibrahim Shaikh — Spotify-Themed Interactive Portfolio & AI Career Platform  
**Document Version:** 1.0  
**Date:** October 29, 2026  
**Candidate / Product Owner:** Muhammad Ibrahim Shaikh  
**Target Platform:** Desktop Web Application (1:1 Spotify Desktop Client Architecture)

## 1. Executive Summary Sets the Product Vision and Conversion Strategy

Muhammad Ibrahim Shaikh's portfolio web application reimagines a traditional engineering portfolio as a **1:1 functional replica of the Spotify Desktop Client**. Instead of static text sections, complex production AI architectures, work experiences, academic credentials, research publications, and faculty endorsements are organized into interactive **Playlists**, **Tracks**, **Artist Profiles**, **Now Playing Inspector Panels**, **Listening Activity Feeds**, and an **AI-Powered Conversational Search Bar**.

The platform serves two primary user segments—**Technical Recruiters** and **Startup Founders / Engineering Leaders**—driving them toward two measurable conversion goals:
1. **Primary Call-to-Action (CTA):** Curating a custom **"Your Recruiter Mix"** (`Liked Songs`) of projects and skills, submitting a pre-filled outreach message via email, and booking an introductory call via [Google Calendar Appointment Scheduling](https://calendar.google.com/).
2. **Secondary Call-to-Action (CTA):** Downloading Muhammad Ibrahim Shaikh's canonical PDF Resume or switching to a standalone **Standard Recruiter View** via the top-right window minimize (`-`) escape hatch.

## 2. Canonical Candidate Identity & Contact Profile Ground All Global UI Metadata

All global headers, sidebar filter pills, contact modals, and AI knowledge bases across the portfolio draw from this single verified source of truth (with all historical references to excluded ventures such as Aveniq Labs and LaborIQ strictly omitted):

| Attribute | Canonical Value | UI Surface Mapping |
| :--- | :--- | :--- |
| **Full Name** | Muhammad Ibrahim Shaikh | Profile Banner Title (`ibrahimm` / `Muhammad Ibrahim Shaikh`) |
| **Headline Role** | AI & Product Engineer | Profile Subtitle & Default Hero Tagline |
| **Header Stats Tagline** | `AI & Product Engineer • 8+ Production Systems • NUST '27 • 1x Hackathon Winner` | Profile Banner Metadata Line |
| **Locations** | Islamabad, Pakistan & Karachi, Pakistan (`Open to Remote`) | Profile Metadata & Left Sidebar Location Pill |
| **Phone Number** | `+92 313 2228891` (`03132228891`) | Left Sidebar Filter Pill (`tel:+923132228891`) |
| **Email Address** | [m.ibrahimshaikh357@gmail.com](mailto:m.ibrahimshaikh357@gmail.com) | Left Sidebar Filter Pill & Booking Modal Target |
| **GitHub Profile** | [github.com/mibrahimm1](https://github.com/mibrahimm1) | Left Sidebar Filter Pill & Track Repository Links |
| **LinkedIn Profile** | [linkedin.com/in/ibrahimshaikhh](https://www.linkedin.com/in/ibrahimshaikhh/) | Left Sidebar Filter Pill & Header Social Link |
| **Executive Bio** | Software Engineering student at NUST with production experience in designing agentic AI systems and automation infrastructure. Proven ability to build end-to-end pipelines in NLP, computer vision, multimodal AI, and full-stack integration. Skilled in Python, PyTorch, LangChain, LLM, RAG pipelines, Agentic workflows, n8n, and production LLM operations. Winner of the AI hackathon at NUST. Seeking roles in AI and Product Engineering to work on multimodal agentic architectures, automated software tools, intelligent systems, and applied AI. | Profile Bio Card, AI Search Context, and Right Sidebar Default Summary |

## 3. Music-to-Engineering Domain Mapping Defines the Information Architecture

Every native surface of the Spotify Desktop interface maps deterministically to a specific dimension of Muhammad Ibrahim Shaikh's portfolio:

| Spotify UI Component | Portfolio Functional Equivalent | Interactive Behavior |
| :--- | :--- | :--- |
| **Top Home Icon (`🏠`)** | Return to Candidate Home Profile | Resets the Center Stage to the main `Muhammad Ibrahim Shaikh` Profile View |
| **Top Search Bar (`What do you want to play? Ctrl+L`)** | First-Person AI Portfolio Chatbot | Opens a floating dropdown popover containing 4–5 clickable starter prompts (`Recent searches`) and a live conversational chat thread |
| **Top-Right Bell Icon (`🔔`)** | Static Decorative Icon | Non-interactive icon preserved for 1:1 visual fidelity with the Spotify header |
| **Top-Right Friends Icon (`👥`)** | Toggle `Listening activity` (Endorsements & Testimonials) | Opens/closes the right-hand `Listening activity` feed featuring faculty and industry recommenders |
| **Top-Right Minimize Button (`-`)** | Recruiter Escape Hatch | Displays a clear tooltip (`Switch to Standard Resume View`) and loads a separate traditional portfolio UI |
| **Left Sidebar Filter Pills** | Direct Contact & Social Links | One-click action pills for **GitHub**, **LinkedIn**, **Email**, **Phone (`03132228891`)**, and **Location (`ISB / KHI · Remote`)** |
| **Left Sidebar Pinned `Liked Songs`** | **"Your Recruiter Mix"** Custom Playlist | Displays a live badge counter of all tracks/projects bookmarked via the `+` / Heart button across the app |
| **Left Sidebar Library List** | Portfolio Category Playlists | Houses the 6 core category playlists: *Featured Projects*, *Work Experience*, *Education*, *Research & Publications*, *Volunteering & Leadership*, and *Courses, Certifications & Honors* |
| **Center Profile "Top artists this month"** | Top 8 Core Technologies (Circular Avatars) | Non-clickable visual showcase badges highlighting primary engineering stack |
| **Center Profile "Public Playlists"** | Core Portfolio Sections (Square Cards) | Clickable album/playlist cards that open the standard Spotify Playlist Table View in the Center Stage |
| **Playlist Action Bar (`Play`, `Download`, `Collaborate`)** | Playlist Playback, Resume Download & Call Booking | Green Play auto-cycles tracks; Download arrow downloads the PDF Resume; Person+ opens the Google Meet booking flow |
| **Playlist `✎ Name & details` Pill** | **`✎ Send Mix & Book Call`** Modal Trigger | Opens the Spotify `Edit details` modal pre-filled with bookmarked items, contact fields, and the Google Calendar Appointment link |
| **Right Sidebar (`Now Playing View`)** | Contextual Track Inspector | Dynamically displays Cover Art, Title, `Lyrics preview` (Headline Metric Hook), `About the [Item]`, `Credits` (Tech Stack / Coursework), and `Next in queue` (GitHub / External Link) |
| **Bottom Bar Scrubber (`0:00 — 3:14`)** | Gentle Auto-Advancing Highlight Timer | Automatically progresses on a smooth visual timer (no ambient audio) to cycle through active track highlights |
| **Bottom-Right Microphone Icon (`🎤 Lyrics`)** | Personal Cover Letter Easter Egg | Marked with a subtle pulsing green indicator; opens the full-stage synchronized Lyrics view auto-scrolling line-by-line through a personal cover letter (populated with placeholder *Lorem Ipsum* until final copy is inserted) |
| **Profile Banner Settings Gear (`⚙`)** | Accent Color Theme Switcher | Swaps the global primary accent token between **Spotify Green** (`#1DB954`), **Electric Purple**, **Cyber Orange**, **Crimson Red**, and **Ocean Blue** |

## 4. Canonical Content Inventory Populates Every Playlist and Track

### 4.1 Home Profile: "Top Artists This Month" (8 Non-Clickable Circular Tech Badges)
1. **Python** — *Primary Language · AI & Backend*
2. **LangChain & LangGraph** — *Agentic Orchestration & State Graphs*
3. **PyTorch & Computer Vision** — *YOLOv8/v11, SAM 2, VLM Fine-Tuning*
4. **n8n & Workflow Automation** — *Multi-Tenant Agent Infrastructure*
5. **RAG & Vector Databases** — *FAISS, ChromaDB, Supabase Hybrid Search*
6. **FastAPI & Next.js** — *Full-Stack Production AI Deployment*
7. **LLMs & Multimodal AI** — *Qwen 3.6, Gemini 2.5 Flash, Whisper, BiCodec TTS*
8. **PostgreSQL & AWS** — *Row-Level Security, EC2/S3, Docker*

### 4.2 Playlist 1: Featured Projects (8 Tracks)
No sub-filter pills are rendered inside the playlist view. Each track row populates the Playlist Table (`#`, `Title & Stack Subtitle`, `Album [Category]`, `Date added`, `⏱ [Domain Tag]`) and opens the Right Sidebar when clicked:

| # | Track Title & Links | Core Stack Subtitle (`Credits`) | `Album` Column | `Date added` | `⏱ Duration` (Domain) | Headline Hook (`Lyrics preview`) & Key Details (`About the Project`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Konvex — AI-Native Multi-Platform E-Commerce Assistant** *(In Development)* | Multi-Agent State Graph, Supabase, Shopify & WooCommerce APIs, Meta Messaging Suite, Pydantic | LP · Final Year Project (In Dev) | May 2026 – Present | Agentic Commerce | **Hook:** *0% Pricing Hallucination Target • Unified Meta/Shopify/WooCommerce Inbox (In Development)*<br>**Details:** Co-founded/leading a 4-person MCS NUST capstone team (supervised by [Asst. Prof. Khawir Mahmood](https://scholar.google.com/citations?user=wixHCFkAAAAJ&hl=en)). Unifies WhatsApp, Instagram, Shopify, and WooCommerce into one live inbox. Features specialized worker agents for catalog retrieval, product recommendation, order modification, and checkout execution, backed by Supabase hybrid semantic + keyword search, deterministic Pydantic validation, real-time database locks, and an automated conversation quality audit module resolving 40–60% of support queries. |
| **2** | **[Multimodal Medical Report Analyzer](https://www.google.com/search?q=https://github.com/mibrahimm1/medical_report_analyzer)** · **[Live Demo](https://medical-report-analyzer-pi.vercel.app/)** | YOLOv8, FastAPI, LangChain, Google Gemini, Next.js, Docker | LP · Full-Stack AI | 2025 | MedTech Vision | **Hook:** *14,000+ Chest X-Rays • 0.99 Healthy / 0.88 Cardiomegaly mAP@50 • Real-Time Grounding*<br>**Details:** Fine-tuned YOLOv8 across 25 epochs on a T4 GPU to detect 14 thoracic abnormalities (0.99 mAP@50 healthy, 0.88 Cardiomegaly, 0.87 Aortic Enlargement). Architected a multimodal FastAPI + LangChain backend cross-referencing vision detections with parsed clinical text, deployed with a real-time split-screen Next.js dashboard and interactive bounding-box grounding toggle. |
| **3** | **[Sonyc — Production Multimodal RAG System](https://www.google.com/search?q=https://github.com/mibrahimm1/sonyc_rag)** | Python, FastAPI, LangChain, FAISS, ChromaDB, BGE/Gemini Embeddings, AWS EC2 | LP · Production RAG | 2025 | Multimodal RAG | **Hook:** *40% Latency Reduction on AWS EC2 • Dual FAISS/ChromaDB Vector Indexing*<br>**Details:** Ingests PDFs, GitHub repos, YouTube transcripts, and live web pages into a unified vector knowledge base using semantic chunking and BGE/Gemini embeddings. Built with LangChain Runnables, Prompt Templates, and multi-step Chains; deployed on AWS EC2 with embedding caching and async processing. |
| **4** | **[Autonomous Gmail Monitoring Agent](https://www.google.com/search?q=https://github.com/mibrahimm1/gmail_monitoring_agent)** | Python, LangGraph (StateGraph), Gmail API, Google Sheets API v4, Pydantic, Tenacity | EP · Agentic Workflow | 2026 | Autonomous Agent | **Hook:** *6-Node Deterministic LangGraph StateGraph • Fault-Tolerant Inbox Automation*<br>**Details:** Event-driven agentic pipeline autonomously monitoring inboxes, classifying intent via structured LLM outputs, analyzing thread context for unanswered queries, and logging deduplicated records to Google Sheets API v4 with Tenacity exponential backoff and Pydantic validation. |
| **5** | **[Edge IoT Voice Assistant](https://www.google.com/search?q=https://github.com/mibrahimm1/voicebot)** | Raspberry Pi, PyAudio, WebRTC VAD, FastAPI, Groq Whisper, Llama 3.3 | EP · Edge AI Hardware | 2025 | Edge IoT & Voice | **Hook:** *Sub-Second Groq Whisper STT + Llama 3.3 Reasoning on Raspberry Pi Hardware*<br>**Details:** Real-time hardware voice assistant connecting a Raspberry Pi edge client over local HTTP streams to a distributed FastAPI backend. Uses client-side WebRTC Voice Activity Detection (VAD) to eliminate idle bandwidth, chaining Whisper STT, Llama 3.3 conversational reasoning, and async TTS playback. |
| **6** | **[AI-Powered Video Calling Application](https://www.google.com/search?q=https://github.com/mibrahimm1/code_connect)** *(Code Connect '25 Winner)* | WebRTC, Socket.IO, Google Gemini 2.5 Flash, Google Cloud Translation API, Vercel | LP · 1st Place Hackathon | 2025 | Real-Time WebRTC | **Hook:** *1st Place Among 20+ National Teams at Code Connect 2025 AI Hackathon*<br>**Details:** Peer-to-peer low-latency video calling platform built with WebRTC connection handshakes and Socket.IO, integrating Gemini 2.5 Flash for real-time speech-to-text transcription, automatic language detection, and live cross-lingual translation. |
| **7** | **[Brain Tumor Detection and Segmentation](https://www.google.com/search?q=https://github.com/mibrahimm1/brain_tumor_app)** | PyTorch, YOLOv11n, SAM 2, OpenCV, CUDA, Jupyter | EP · Medical Vision | 2025 | Zero-Shot CV | **Hook:** *1,765 MRI Scans • 0.95 Meningioma & 0.974 Healthy mAP@50 • YOLOv11 + SAM 2*<br>**Details:** Trained a lightweight YOLOv11n detector across 5 pathological classes on a Tesla T4 GPU and engineered a promptable zero-shot segmentation pipeline piping YOLO bounding-box predictions into SAM 2 to generate pixel-level cranial lesion masks. |
| **8** | **[WhatsApp Chat Analytics and RAG Assistant](https://www.google.com/search?q=https://github.com/mibrahimm1/whatsapp_chat_analyzer)** | Python, LangChain, Streamlit, Vector Embeddings, Pandas | Single · Data & RAG | 2025 | Conversational Analytics | **Hook:** *Interactive Behavioral Telemetry + Embedded ChatGuru LangChain RAG*<br>**Details:** Parses unstructured WhatsApp chat exports in Streamlit to compute temporal distributions and interaction metrics, paired with ChatGuru for natural-language semantic querying over indexed conversation archives. |

### 4.3 Playlist 2: Work Experience (4 Tracks)
Bryt has been moved to *Volunteering & Leadership* per candidate specification, leaving four dedicated engineering roles:

| # | Track Title (`Role`) & Subtitle (`Company`) | `Album` Column | `Date added` (Tenure) | `⏱ Duration` (Mode/Loc) | Headline Hook (`Lyrics preview`) & Key Details (`About the Role`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **AI & Product Engineer** · *Horquva LLC* | Enterprise Dependency Graph & Copilot | Oct 2026 – Present | Remote · US | **Hook:** *58-Table Multi-Tenant RLS • 23-Endpoint Gateway • 100% Pass Rate (53 Suites)*<br>**Details:** Architected core dependency graph and topological blast-radius simulation engine in TypeScript/PostgreSQL to detect single points of failure when employees depart or third-party APIs fail. Shipped 7 end-to-end features including an interactive dependency map, a "What-If" departure simulator, a 60-second magic-link manager review portal, and a grounded Gemini copilot. |
| **2** | **AI Automation Engineer & Product Growth** · *BizBuddy (B&B Technologies)* | Nexus Gen-4 WhatsApp Ordering Engine | Jun 2026 – Aug 2026 | Onsite · Karachi | **Hook:** *89% LLM Cost Reduction • 157,000+ Messages • 25+ Restaurant Clients*<br>**Details:** Architected the multi-tenant "Nexus" Gen-4 conversational agent across 25+ restaurants (28,800+ catalog items, 16,300+ delivery areas, 3M+ peak daily tokens), cutting client onboarding from 24–40 hours to 8–12 hours. Built a multimodal WhatsApp Cloud API pipeline (OpenAI Whisper Roman Urdu STT + Gemini 2.5 Flash Vision), a 9-to-12 custom tool-calling engine against PostgreSQL, a 5-layer error-handling framework with a two-phase "Prepare-Confirm" transactional commit pattern, and dynamic prompt compilation (shrinking prompts from ~46.5K to ~9K tokens). Migrated production agents from Gemini 2.5 Flash to Qwen 3.6 Flash (80% fewer input tokens, 7x faster TTFT, 89% cost reduction), built zero-migration Blink POS & Technosys/Syrve POS integrations, established a 65-test QA suite (~98% accuracy), closed key B2B accounts, and interviewed 20+ intern candidates. |
| **3** | **AI Engineer Intern** · *Entropik Labs* | Multimodal VLM & BiCodec TTS Pipelines | Jul 2025 – Sep 2025 | Remote · Islamabad | **Hook:** *BiCodec Synthetic Voice Pipeline (UTMOS/WER) • VLM Fine-Tuning • 5+ Agent Tools*<br>**Details:** Architected an automated BiCodec TTS tokenization, detokenization, and synthesis pipeline with UTMOS and WER quality gates. Built a multimodal OCR data-curation pipeline using Docling and Llama 4, fine-tuning 3 lightweight Vision-Language Models (SmolVLM, SmolDocling, Gemma-3-270M) with Hugging Face. Integrated 5+ live tools (events, weather, news, geocoding, POI search) into a production LangChain + GPT-4o mini agent with a Next.js/TypeScript frontend. |
| **4** | **Machine Learning Intern** · *Arch Technologies* | Supervised ML & Feature Engineering | Apr 2025 – Jun 2025 | Remote · Islamabad | **Hook:** *~15% Production Model Accuracy Improvement Over Baseline*<br>**Details:** Built and optimized supervised machine learning pipelines in Python with end-to-end feature engineering, hyperparameter tuning, and portfolio model deployments across medical imaging, predictive modeling, and conversational analytics. |

### 4.4 Playlist 3: Education (3 Tracks)

| # | Track Title (`Degree`) & Subtitle (`Institution`) | `Album` Column | `Date added` | `⏱ Duration` (Grade) | Right Sidebar `About` & `Credits` (Coursework) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Bachelor of Software Engineering** · *National University of Sciences and Technology (NUST)* | Military College of Signals (MCS), Islamabad | Oct 2023 – May 2027 (7th Sem) | **CGPA: 3.59 / 4.0** | **Honors:** 100% Fully Funded NTF Need-cum-Merit Scholarship & GPA Merit Scholarship Recipient.<br>**Credits (Relevant Coursework):** Machine Learning (Grade: A), Deep Learning, Object-Oriented Programming, Data Structures & Algorithms, Design & Analysis of Algorithms, Software Engineering, Software Design & Architecture, Software Project Management, Linear Algebra & ODEs, Probability & Statistics, Complex Variables & Transforms. |
| **2** | **GCE A Levels (Computer Science)** · *Cedar College* | CAIE Examinations · Karachi | Aug 2021 – Aug 2023 | **1 A\*, 2 As** | Completed Cambridge International GCE Advanced Levels with distinction in Mathematics, Physics, and Computer Science. |
| **3** | **GCE O Levels (Computer Science)** · *Beaconhouse School System* | CAIE Examinations · Karachi | 2018 – Aug 2021 | **7 A\*s, 3 As** | Completed Cambridge International GCE Ordinary Levels with 7 A* and 3 A grades across STEM and core subjects. |

### 4.5 Playlist 4: Research & Publications (1 Track)

| # | Track Title & Venue | `Album` Column | `Date added` | `⏱ Duration` (DOI) | Right Sidebar Summary & External Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **[Enhancing Secrecy Capacity Using Reconfigurable Intelligent Surfaces in Line-of-Sight (LOS) Scenarios for Beyond 5G Networks](https://www.google.com/search?q=https://doi.org/10.22214/ijraset.2025.66898)** | *IJRASET*, Vol. 13, Issue II, pp. 526–531 | Feb 2025 | `10.22214/ijraset.2025.66898` | Published peer-reviewed research investigating physical-layer security and secrecy capacity optimization using Reconfigurable Intelligent Surfaces (RIS) in Line-of-Sight Beyond-5G wireless propagation environments. |

### 4.6 Playlist 5: Volunteering & Leadership (4 Tracks, Including Bryt)

| # | Track Title (`Role`) & Subtitle (`Organization`) | `Album` Column | `Date added` | `⏱ Duration` (Impact) | Right Sidebar Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Secretary Media & Executive Panelist** · *Software Society, MCS NUST* | Brand Identity & Department Publications | Jul 2024 – Jun 2025 | 5-Person Core Team | Directed creative committee managing brand identity, digital outreach, and multimedia coverage across department-wide initiatives. Redesigned the official Software Society visual identity and led layout/typesetting for the annual departmental magazine *Resurgence*. |
| **2** | **Director Media & Executive Director's Panel** · *DevCon '25 (NUST)* | National Hackathon Branding & Outreach | 2025 | 12-Person Media Team | Spearheaded brand identity, promotional design, and national digital media outreach strategy for NUST's premier national software and AI hackathon. |
| **3** | **Subject Support Associate (STEM / Computer Science)** · *Bryt* | CAIE Academic Mentorship · Karachi | Mar 2022 – Sep 2022 | 7 Months · STEM | Provided academic mentorship and technical problem resolution for students preparing for Cambridge (CAIE) Computer Science and STEM examinations; audited student solutions for conceptual accuracy. |
| **4** | **Eco-Intern** · *WWF-Pakistan* | Ecological Conservation & Outreach | Jul 2022 | Conservation Cohort | Completed WWF-Pakistan's Eco-Internship Program, contributing to environmental sustainability campaigns, ecological conservation workshops, and community outreach. |

### 4.7 Playlist 6: Courses, Certifications & Honors (7 Tracks)

| # | Track Title | `Album` (Issuer) | `Date added` | `⏱ Duration` (Type) | Right Sidebar Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Winner — Code Connect 2025 AI Hackathon** | NUST National Competition | 2025 | **1st Place / 20+ Teams** | Ranked 1st overall among 20+ competing teams across Pakistan by delivering a production-ready real-time AI video calling and translation solution under hackathon pressure. |
| **2** | **NTF Scholarship Recipient (100% Tuition Covered)** | National University of Sciences & Technology | 2023 – 2027 | **100% Funded** | Awarded a 100% fully funded Need-cum-Merit undergraduate scholarship at NUST. |
| **3** | **GPA Merit Scholarship Recipient** | National University of Sciences & Technology | 2024 – 2026 | **Top GPA Scorer** | Awarded merit-based scholarship recognizing top academic GPA standing in the Software Engineering cohort. |
| **4** | **Machine Learning Specialization** | DeepLearning.AI / Coursera | 2025 | Verified Specialization | Completed supervised learning (regression, classification), neural networks, decision trees, unsupervised learning, and recommender systems. |
| **5** | **Python for Data Science, AI and Development** | IBM | 2025 | Verified Certificate | Completed applied Python programming for data science workflows, APIs, and AI model development. |
| **6** | **Supervised Machine Learning: Regression and Classification** | DeepLearning.AI | 2025 | Verified Course | Mastered gradient descent, regularized cost functions, and linear/logistic implementation from first principles. |
| **7** | **Introduction to Cloud Computing** | IBM / Coursera | 2024 | Verified Course | Covered cloud architecture, deployment models, containerization, and distributed cloud infrastructure. |

## 5. Endorsements & Recommender Profile System (`Listening Activity`)

Clicking the top-right **Friends Activity (`👥`)** icon toggles the right-hand **`Listening activity`** panel. Two verified academic recommenders are pre-loaded at launch, with the schema designed to seamlessly accommodate future **Academic** or **Industry** recommenders:

| Recommender Name & External Link | Title & Affiliation | Linked Portfolio Track (`🎵` / `💿` Clickable Link) | Endorsement Highlights (From Signed Letters of Recommendation, Sept 7, 2026) |
| :--- | :--- | :--- | :--- |
| **[Dr. Saeed Murtaza](https://scholar.google.com/citations?user=hveYKTcAAAAJ&hl=en)** ([NUST Faculty Profile](https://mcs.nust.edu.pk/faculty/saeed-murtaza/)) | Associate Professor, Dept. of Computer Software Engineering, MCS NUST · Ph.D. Physics & Space Research, University of Birmingham, UK (`smurtaza@mcs.edu.pk`) | `💿 Bachelor of Software Engineering — NUST` (Education Playlist, Track #1) | **Top 5% Ranking:** Taught Ibrahim across consecutive semesters since Spring 2024 in *Linear Algebra & ODEs*, *Probability & Statistics*, and *Complex Variables & Transforms*. Highlights his first-principles mathematical inquiry, ability to translate probabilistic/linear-algebraic derivations into functional ML/Data Engineering architectures, and natural team leadership. |
| **[Asst. Prof. Khawir Mahmood](https://scholar.google.com/citations?user=wixHCFkAAAAJ&hl=en)** | Assistant Professor & FYP Supervisor, Dept. of Computer Software Engineering, MCS NUST (`khawir@mcs.edu.pk`) | `🎵 Konvex — AI-Native E-Commerce Assistant` (Featured Projects, Track #1) & `💿 Bachelor of Software Engineering — NUST` | **Top 5% Ranking & Grade "A" in ML:** Supervised Ibrahim's FYP (*Konvex*) and taught him *OOP*, *Machine Learning* (where students derive backpropagation and gradient descent by hand; Ibrahim earned a solid A), and *Deep Learning*. Praises his engineering-first approach to deterministic safety boundaries in agentic LLMs, unanimous Title Defense approval without a single objection, and empirical self-direction. |

### Recommender Profile View Mechanics
When a visitor clicks a recommender in `Listening activity`:
1. **Clicking their External Link Icon / Badge** opens their [Google Scholar](https://scholar.google.com/citations?user=hveYKTcAAAAJ&hl=en) (for Academic) or LinkedIn profile (for Industry) in a new browser tab.
2. **Clicking their Card / Name** loads a **Spotify Recommender Profile Screen** in the Center Stage (modeled directly on the `Profile` screen in `image_d7ace6.jpg`), featuring:
   - **Profile Header:** Recommender photo/avatar, verification badge (`Verified Academic Endorsement` or `Verified Industry Endorsement`), full name, title/institution, and headline ranking (`Ranks Ibrahim in Top 5% of Undergraduates`).
   - **Action Bar:** Buttons for **`Open Google Scholar / LinkedIn ↗`** and **`View Original Signed Letter`**.
   - **Circular Row ("Vouched Competencies & Courses"):** 5–6 circular badges representing the specific courses, mathematical foundations, or production engineering skills verified by that recommender.
   - **Endorsement Content & Linked Tracks (`Public Playlists`):** Displays the structured recommendation letter text alongside clickable square cards linking directly to the NUST Education track, Konvex FYP track, or relevant Work Experience track.
