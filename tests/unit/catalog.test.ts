import { describe, it, expect } from 'vitest';
import {
  buildTechPlaylist,
  formatPlaylistLength,
  resolvePlaylist,
  stanzaStartFractions,
} from '@/lib/catalog';
import { technologyAvatars, coverLetterStanzas } from '@/data/portfolioData';
import { entryToHash, hashToEntry } from '@/lib/routing';
import { deepTone, isLight } from '@/lib/color';
import { processAIQuery } from '@/lib/aiEngine';

describe('Catalog', () => {
  it('builds a non-empty "This Is" playlist for every technology avatar', () => {
    for (const tech of technologyAvatars) {
      const playlist = buildTechPlaylist(tech.id);
      expect(playlist, tech.id).toBeDefined();
      expect(playlist!.tracks.length, tech.id).toBeGreaterThan(0);
      expect(playlist!.title).toBe(`This Is ${tech.name}`);
    }
  });

  it('resolves the Recruiter Mix in saved order and ignores unknown ids', () => {
    const mix = resolvePlaylist('recruiter-mix', ['work-bizbuddy', 'nope', 'project-konvex']);
    expect(mix.tracks.map((t) => t.id)).toEqual(['work-bizbuddy', 'project-konvex']);
  });

  it('formats playlist length like Spotify', () => {
    expect(formatPlaylistLength(0)).toBe('0 items');
    expect(formatPlaylistLength(1)).toBe('1 item, about 1 min');
    expect(formatPlaylistLength(8)).toBe('8 items, about 4 min');
  });

  it('weights stanza start points by length', () => {
    expect(stanzaStartFractions).toHaveLength(coverLetterStanzas.length);
    expect(stanzaStartFractions[0]).toBe(0);
    for (let i = 1; i < stanzaStartFractions.length; i++) {
      expect(stanzaStartFractions[i]).toBeGreaterThan(stanzaStartFractions[i - 1]);
    }
    expect(stanzaStartFractions[stanzaStartFractions.length - 1]).toBeLessThan(1);
  });
});

describe('Routing', () => {
  it('round-trips every view through the URL hash', () => {
    const entries = [
      { view: 'playlist' as const, playlistId: 'tech:python' },
      { view: 'recruiter-mix' as const, playlistId: 'recruiter-mix' },
      { view: 'recommender' as const, recommenderId: 'khawir-mahmood' },
      { view: 'lyrics' as const },
      { view: 'browse' as const },
    ];
    for (const entry of entries) {
      expect(hashToEntry(entryToHash(entry))).toEqual(entry);
    }
    expect(hashToEntry('')).toBeNull();
    expect(hashToEntry('#/unknown')).toBeNull();
  });
});

describe('Colour helpers', () => {
  it('darkens pastels enough for white text', () => {
    expect(isLight('#D5F479')).toBe(true);
    expect(isLight(deepTone('#D5F479'))).toBe(false);
  });
});

describe('AI keyword matching', () => {
  it('matches at word starts only', () => {
    // "storage" used to trigger the RAG answer and "same" the SAM 2 answer.
    expect(processAIQuery('what storage do you use').referencedTrack?.id).not.toBe('project-sonyc-rag');
    expect(processAIQuery('is it the same as before').referencedTrack?.id).not.toBe('project-brain-tumor');
    expect(processAIQuery('tell me about your RAG work').referencedTrack?.id).toBe('project-sonyc-rag');
    expect(processAIQuery('how did you use SAM 2').referencedTrack?.id).toBe('project-brain-tumor');
  });
});
