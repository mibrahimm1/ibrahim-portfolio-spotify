import { CandidateProfile, StarterPrompt, Track } from '@/types/portfolio';
import { PortfolioContent } from '@/content/schema';
import { aiConfig, allPlaylists, candidateProfile, starterPrompts } from '@/data/portfolioData';

interface AIResponse {
  answer: string;
  referencedTrack?: Track;
}

/**
 * Everything the "Ask <name>'s AI" assistant needs. Defaults to the published content;
 * the dashboard passes a draft so answers can be tested before saving.
 */
export interface AIEngineConfig {
  intents: PortfolioContent['ai']['intents'];
  defaultAnswer: string;
  starterPrompts: StarterPrompt[];
  profile: CandidateProfile;
  tracks: Track[];
}

const defaultConfig: AIEngineConfig = {
  intents: aiConfig.intents,
  defaultAnswer: aiConfig.defaultAnswer,
  starterPrompts,
  profile: candidateProfile,
  tracks: allPlaylists.flatMap((p) => p.tracks),
};

const PLACEHOLDERS = ['name', 'firstName', 'email', 'phone', 'phoneDisplay', 'role'] as const;

/** Replaces {name}, {firstName}, {email}, {phone}, {phoneDisplay} and {role} in an answer. */
export function fillTemplate(text: string, profile: CandidateProfile): string {
  return PLACEHOLDERS.reduce((out, key) => out.split(`{${key}}`).join(String(profile[key] ?? '')), text);
}

/**
 * A deterministic, first-person keyword router standing in for an LLM.
 * Order of precedence: a starter prompt the query starts with, then the first intent
 * (in content order) with a keyword at a word start, then the default answer.
 */
export function processAIQuery(query: string, config: AIEngineConfig = defaultConfig): AIResponse {
  const normalized = query.toLowerCase().trim();
  // Match keywords at a word start so "rag" doesn't fire on "storage" or "sam" on "same".
  const has = (keyword: string) =>
    new RegExp(`(^|[^a-z0-9])${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(normalized);
  const findTrack = (id?: string) => (id ? config.tracks.find((t) => t.id === id) : undefined);

  const matchedPrompt = config.starterPrompts.find((p) => normalized.includes(p.question.toLowerCase().slice(0, 20)));
  if (matchedPrompt) {
    return {
      answer: fillTemplate(matchedPrompt.initialResponse, config.profile),
      referencedTrack: findTrack(matchedPrompt.referencedTrackId),
    };
  }

  const intent = config.intents.find((i) => i.keywords.some(has));
  if (intent) {
    return { answer: fillTemplate(intent.answer, config.profile), referencedTrack: findTrack(intent.trackId) };
  }

  return { answer: fillTemplate(config.defaultAnswer, config.profile) };
}
