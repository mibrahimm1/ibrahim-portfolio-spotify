import { describe, it, expect } from 'vitest';
import portfolio from '../fixtures/portfolio.json';
import { PortfolioSchema, PortfolioContent } from '@/content/schema';
import {
  cleanReferences,
  findReferences,
  getAt,
  moveIndex,
  newItem,
  renameReferences,
  setAt,
  slugify,
  uniqueId,
  usedUploads,
  aiConfigFromDraft,
} from '@/components/dashboard/model';
import { processAIQuery } from '@/lib/aiEngine';

const content = () => structuredClone(portfolio) as PortfolioContent;

describe('dashboard draft helpers', () => {
  it('setAt is immutable and deletes keys set to undefined', () => {
    const c = content();
    const next = setAt(c, ['profile', 'gpa'], undefined);
    expect('gpa' in next.profile).toBe(false);
    expect(c.profile.gpa).toBeDefined();
    expect(next.playlists).toBe(c.playlists); // untouched branches are shared
    expect(getAt(setAt(c, ['playlists', 0, 'title'], 'X'), ['playlists', 0, 'title'])).toBe('X');
  });

  it('moves items and builds unique slugs', () => {
    expect(moveIndex(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveIndex(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
    expect(slugify('Konvex — AI-Native Café!')).toBe('konvex-ai-native-cafe');
    expect(uniqueId('Item', ['item', 'item-2'])).toBe('item-3');
  });
});

describe('references', () => {
  it('finds every place a track is used', () => {
    const labels = findReferences(content(), 'track', 'project-konvex');
    expect(labels.map((r) => r.path.join('.'))).toEqual(
      expect.arrayContaining(['ai.intents.1.trackId', 'whatsNew.2', expect.stringMatching(/^recommenders\.\d+\.linkedTrackId$/)])
    );
    expect(labels.some((r) => r.required)).toBe(true);
  });

  it('cleaning optional references leaves only required ones for the user to fix', () => {
    const c = content();
    c.playlists[0].tracks = c.playlists[0].tracks.filter((t) => t.id !== 'project-konvex');
    const cleaned = cleanReferences(c, 'track', 'project-konvex');
    const issues = PortfolioSchema.safeParse(cleaned).error?.issues ?? [];
    expect(issues.map((i) => i.path.join('.'))).toEqual([expect.stringMatching(/^recommenders\.\d+\.linkedTrackId$/)]);
  });

  it('renaming an id updates every reference and stays valid', () => {
    const c = content();
    const track = c.playlists[0].tracks.find((t) => t.id === 'project-konvex')!;
    track.id = 'konvex';
    const renamed = renameReferences(c, 'track', 'project-konvex', 'konvex');
    expect(PortfolioSchema.safeParse(renamed).success).toBe(true);
    expect(findReferences(renamed, 'track', 'konvex').length).toBeGreaterThan(0);
    expect(findReferences(renamed, 'track', 'project-konvex')).toEqual([]);
  });

  it('renaming a playlist updates the featured playlist and resume sections', () => {
    const c = content();
    c.playlists[0].id = 'projects';
    const renamed = renameReferences(c, 'playlist', 'featured-projects', 'projects');
    expect(renamed.home.featuredPlaylistId).toBe('projects');
    expect(PortfolioSchema.safeParse(renamed).success).toBe(true);
  });

  it('collects uploaded file paths', () => {
    const c = content();
    c.profile.avatarImage = '/uploads/me-1234.webp';
    expect([...usedUploads(c)]).toEqual(['/uploads/me-1234.webp']);
  });
});

describe('new items', () => {
  it('get ids that do not collide with existing ones', () => {
    const c = content();
    const track = newItem.track(c);
    expect(c.playlists.flatMap((p) => p.tracks).some((t) => t.id === track.id)).toBe(false);
    expect(newItem.playlist(c).id).not.toBe(c.playlists[0].id);
  });
});

describe('AI test box', () => {
  it('answers from an unsaved draft', () => {
    const c = content();
    c.ai.intents.unshift({ id: 'draft-only', keywords: ['zebra'], answer: 'Draft answer for {firstName}' });
    expect(processAIQuery('tell me about zebras', aiConfigFromDraft(c)).answer).toBe(`Draft answer for ${c.profile.firstName}`);
  });
});
