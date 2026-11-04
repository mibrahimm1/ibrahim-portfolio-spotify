import { Track } from '@/types/portfolio';
import {
  candidateProfile,
  allPlaylists,
  starterPrompts,
} from '@/data/portfolioData';

interface AIResponse {
  answer: string;
  referencedTrack?: Track;
}

const allTracks: Track[] = allPlaylists.flatMap((p) => p.tracks);

export function processAIQuery(query: string): AIResponse {
  const normalized = query.toLowerCase().trim();
  // Match keywords at a word start so "rag" doesn't fire on "storage" or "sam" on "same".
  const has = (keyword: string) =>
    new RegExp(`(^|[^a-z0-9])${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(normalized);

  // 1. Direct starter prompt exact or close match
  const matchedPrompt = starterPrompts.find((p) =>
    normalized.includes(p.question.toLowerCase().slice(0, 20))
  );
  if (matchedPrompt) {
    const track = matchedPrompt.referencedTrackId
      ? allTracks.find((t) => t.id === matchedPrompt.referencedTrackId)
      : undefined;
    return {
      answer: matchedPrompt.initialResponse,
      referencedTrack: track,
    };
  }

  // 2. Cost reduction / BizBuddy / Qwen / Token optimization
  if (
    has('cost') ||
    has('bizbuddy') ||
    has('89%') ||
    has('qwen') ||
    has('saving') ||
    has('nexus')
  ) {
    const track = allTracks.find((t) => t.id === 'work-bizbuddy');
    return {
      answer:
        "At BizBuddy, our multi-tenant WhatsApp ordering agent was generating over 3M daily tokens on Gemini 2.5 Flash across 25+ restaurants. I identified massive prompt overhead, shrank dynamic prompts from 46.5K down to 9K tokens, and migrated the inference pipeline to Qwen 3.6 Flash. This achieved 80% fewer input tokens, 7x faster Time-To-First-Token (TTFT), and an overall 89% LLM operational cost reduction while maintaining ~98% order accuracy across a 65-test QA suite.",
      referencedTrack: track,
    };
  }

  // 3. Konvex / Final Year Project / E-commerce / LangGraph
  if (
    has('konvex') ||
    has('fyp') ||
    has('final year') ||
    has('ecommerce') ||
    has('e-commerce') ||
    has('shopify') ||
    has('woocommerce')
  ) {
    const track = allTracks.find((t) => t.id === 'project-konvex');
    return {
      answer:
        "Konvex is my capstone Final Year Project at NUST MCS, supervised by Asst. Prof. Khawir Mahmood. I lead a 4-person team building an AI-native conversational commerce engine that unifies WhatsApp, Instagram, Shopify, and WooCommerce into a single live inbox. We use a deterministic LangGraph state machine, Supabase hybrid search, strict Pydantic validation, and transactional row-level database locks to achieve a 0% pricing hallucination target.",
      referencedTrack: track,
    };
  }

  // 4. Horquva / Dependency Graph / Enterprise / Blast radius
  if (
    has('horquva') ||
    has('dependency') ||
    has('blast') ||
    has('rls') ||
    has('postgres')
  ) {
    const track = allTracks.find((t) => t.id === 'work-horquva');
    return {
      answer:
        "At Horquva LLC, I architected an enterprise dependency graph and blast-radius simulation engine in TypeScript and PostgreSQL across 58 tables with strict Row-Level Security. It detects single points of failure when employees depart or third-party APIs fail. I shipped 7 features including an interactive dependency map, a 'What-If' departure simulator, a 60-second magic-link manager review portal, and a grounded Gemini copilot.",
      referencedTrack: track,
    };
  }

  // 5. Medical Report / X-Ray / Vision / YOLO / Lesion
  if (
    has('medical') ||
    has('x-ray') ||
    has('xray') ||
    has('chest') ||
    has('cardiomegaly') ||
    has('yolo')
  ) {
    const track = allTracks.find((t) => t.id === 'project-medical-report');
    return {
      answer:
        "I built the Multimodal Medical Report Analyzer by fine-tuning YOLOv8 across 25 epochs on a Tesla T4 GPU to detect 14 thoracic abnormalities across 14,000+ X-ray scans. It achieves 0.99 mAP@50 on healthy scans and 0.88 on Cardiomegaly. I connected this to a FastAPI + LangChain backend and a Next.js split-screen dashboard with interactive bounding-box grounding.",
      referencedTrack: track,
    };
  }

  // 6. Hackathon / Code Connect / Video Calling / 1st Place
  if (
    has('hackathon') ||
    has('winner') ||
    has('code connect') ||
    has('video calling') ||
    has('webrtc')
  ) {
    const track = allTracks.find((t) => t.id === 'project-code-connect');
    return {
      answer:
        "At Code Connect 2025 (NUST's national hackathon), my team won 1st Place among 20+ national university teams. We built a real-time peer-to-peer WebRTC video calling platform with Socket.IO, integrating Gemini 2.5 Flash for sub-second speech-to-text transcription and Google Cloud Translation API for live cross-lingual subtitles.",
      referencedTrack: track,
    };
  }

  // 7. RAG / Sonyc / Vector DB / Embeddings
  if (
    has('rag') ||
    has('sonyc') ||
    has('vector') ||
    has('faiss') ||
    has('chroma')
  ) {
    const track = allTracks.find((t) => t.id === 'project-sonyc-rag');
    return {
      answer:
        "Sonyc is a production multimodal RAG system I architected in Python, FastAPI, and LangChain. It ingests PDFs, GitHub repos, YouTube transcripts, and live web pages with semantic chunking and BGE/Gemini embeddings, using a dual FAISS and ChromaDB indexing strategy deployed on AWS EC2 with a 40% query latency reduction.",
      referencedTrack: track,
    };
  }

  // 8. Education / GPA / NUST / Degrees / Scholarships
  if (
    has('gpa') ||
    has('nust') ||
    has('education') ||
    has('degree') ||
    has('scholarship') ||
    has('grade')
  ) {
    const track = allTracks.find((t) => t.id === 'edu-nust');
    return {
      answer:
        "I am currently in my 7th semester of Bachelor of Software Engineering at MCS NUST, holding a 3.59 / 4.0 CGPA on a 100% fully funded Need-cum-Merit NTF Scholarship alongside semester GPA Merit Scholarships. I earned a Grade 'A' in Machine Learning under Asst. Prof. Khawir Mahmood and rank in the top 5% of my cohort. Previously, I earned 1 A* and 2 As in Cambridge A Levels at Cedar College, and 7 A*s and 3 As in O Levels.",
      referencedTrack: track,
    };
  }

  // 9. Recommenders / Professors / Endorsements / References
  if (
    has('recommender') ||
    has('recommendation') ||
    has('saeed') ||
    has('khawir') ||
    has('professor') ||
    has('faculty')
  ) {
    const track = allTracks.find((t) => t.id === 'edu-nust');
    return {
      answer:
        "I have two verified academic recommendations from senior MCS NUST faculty: Dr. Saeed Murtaza (Associate Professor, Ph.D. University of Birmingham UK) who taught me across 3 consecutive math courses and ranks me in the top 5% for first-principles mathematical inquiry; and Asst. Prof. Khawir Mahmood (Assistant Professor & FYP Supervisor) who taught me ML/DL and approved our Konvex Title Defense unanimously. You can view their full profiles by opening Friend Activity (the people icon in the top right).",
      referencedTrack: track,
    };
  }

  // 10. Contact / Hiring / Availability / Remote / Location
  if (
    has('contact') ||
    has('hire') ||
    has('available') ||
    has('remote') ||
    has('email') ||
    has('phone') ||
    has('book') ||
    has('call')
  ) {
    return {
      answer: `I am actively open to AI Engineering and Product Engineering opportunities (Remote or based in Islamabad/Karachi). You can contact me directly at ${candidateProfile.email}, call or WhatsApp at ${candidateProfile.phoneDisplay}, or bookmark your favorite projects in 'Your Recruiter Mix' and click 'Send Mix & Book Call' to schedule time directly on Google Meet!`,
    };
  }

  // 11. Edge IoT / Voice Assistant / Raspberry Pi
  if (
    has('iot') ||
    has('raspberry') ||
    has('voice') ||
    has('whisper') ||
    has('hardware')
  ) {
    const track = allTracks.find((t) => t.id === 'project-voice-assistant');
    return {
      answer:
        "I engineered an Edge IoT Voice Assistant connecting a Raspberry Pi edge client over local HTTP streams to a distributed FastAPI backend. Using client-side WebRTC Voice Activity Detection (VAD) to eliminate idle bandwidth, it chains Groq Whisper STT, Llama 3.3 conversational reasoning, and async TTS playback with sub-second response times.",
      referencedTrack: track,
    };
  }

  // 12. Brain Tumor / SAM 2 / Medical Segmentation
  if (
    has('brain') ||
    has('tumor') ||
    has('sam 2') ||
    has('sam2') ||
    has('segmentation') ||
    has('mri')
  ) {
    const track = allTracks.find((t) => t.id === 'project-brain-tumor');
    return {
      answer:
        "I trained a lightweight YOLOv11n detector across 5 pathological classes on 1,765 cranial MRI scans (achieving 0.95 Meningioma and 0.974 Healthy mAP@50), and coupled it with Meta's SAM 2 to perform promptable zero-shot pixel-level lesion mask segmentation.",
      referencedTrack: track,
    };
  }

  // Default intelligent first-person response
  return {
    answer:
      `I am Muhammad Ibrahim Shaikh — AI & Product Engineer at NUST '27 (3.59 CGPA) with 8+ production systems shipped. I specialize in agentic architectures (LangGraph, n8n), LLM cost-optimization (89% reduction at BizBuddy), computer vision (YOLOv8/v11, SAM 2), and full-stack deployment. Feel free to ask about my projects like Konvex or Medical Report Analyzer, my work at Horquva and BizBuddy, or book a call directly through 'Your Recruiter Mix'!`,
  };
}
