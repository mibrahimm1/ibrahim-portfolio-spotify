import { describe, it, expect } from 'vitest';
import portfolio from '../../content/portfolio.json';
import example from '../../content/portfolio.example.json';
import { PortfolioSchema, safeUrl, formatContentErrors } from '@/content/schema';
import { buildRuntime, allPlaylists, featuredPlaylist, defaultAccentThemeId } from '@/data/portfolioData';
import { parseContent } from '@/data/validateContent';
import { fillTemplate, processAIQuery } from '@/lib/aiEngine';

// This file doubles as `npm run content:validate`: it fails if either JSON file is invalid.

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function errorsFor(mutate: (c: typeof portfolio) => void) {
  const draft = clone(portfolio);
  mutate(draft);
  const result = PortfolioSchema.safeParse(draft);
  return result.success ? '' : formatContentErrors(result.error);
}

describe('content files', () => {
  it('content/portfolio.json is valid', () => {
    const result = PortfolioSchema.safeParse(portfolio);
    expect(result.success ? '' : formatContentErrors(result.error)).toBe('');
  });

  it('content/portfolio.example.json (the fork template) is valid', () => {
    const result = PortfolioSchema.safeParse(example);
    expect(result.success ? '' : formatContentErrors(result.error)).toBe('');
  });

  it('the example template contains no real personal data from the main file', () => {
    const exampleText = JSON.stringify(example).toLowerCase();
    for (const value of [portfolio.profile.email, portfolio.profile.phone, portfolio.profile.name]) {
      expect(exampleText).not.toContain(value.toLowerCase());
    }
  });
});

describe('schema security rules', () => {
  it.each([
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.example.com',
    'https://ok.example.com/"onmouseover="alert(1)',
    'not a url',
  ])('rejects unsafe link %s', (url) => {
    expect(safeUrl.safeParse(url).success).toBe(false);
  });

  it.each(['https://github.com/octocat', 'http://example.com', 'mailto:a@example.com', 'tel:+15550100000'])(
    'accepts safe link %s',
    (url) => {
      expect(safeUrl.safeParse(url).success).toBe(true);
    }
  );

  it('rejects a javascript: link anywhere in the content', () => {
    expect(errorsFor((c) => (c.profile.github = 'javascript:alert(document.cookie)'))).toMatch(/profile\.github/);
    expect(
      errorsFor((c) => (c.playlists[0].tracks[0].externalUrl = 'javascript:alert(1)'))
    ).toMatch(/playlists\.0\.tracks\.0\.externalUrl/);
  });

  it('only allows images uploaded to /uploads', () => {
    expect(errorsFor((c) => ((c.profile as Record<string, unknown>).avatarImage = 'https://evil.example.com/x.png'))).toMatch(/avatarImage/);
    expect(errorsFor((c) => ((c.profile as Record<string, unknown>).avatarImage = '/uploads/../secrets.png'))).toMatch(/avatarImage/);
    expect(errorsFor((c) => ((c.profile as Record<string, unknown>).avatarImage = '/uploads/logo.svg'))).toMatch(/avatarImage/);
    expect(errorsFor((c) => ((c.profile as Record<string, unknown>).avatarImage = '/uploads/me-01.webp'))).toBe('');
  });

  it('requires hex colours and slug ids', () => {
    expect(errorsFor((c) => (c.playlists[0].coverColor = 'red; background:url(x)'))).toMatch(/coverColor/);
    expect(errorsFor((c) => (c.playlists[0].id = 'Has Spaces'))).toMatch(/playlists\.0\.id/);
  });
});

describe('schema referential integrity', () => {
  it('flags duplicate track ids across playlists', () => {
    expect(errorsFor((c) => (c.playlists[1].tracks[0].id = c.playlists[0].tracks[0].id))).toMatch(/Duplicate track id/);
  });

  it('flags references to missing tracks and recommenders', () => {
    expect(errorsFor((c) => (c.recommenders[0].linkedTrackId = 'nope'))).toMatch(/recommenders\.0\.linkedTrackId/);
    expect(errorsFor((c) => (c.whatsNew[0] = 'nope'))).toMatch(/whatsNew\.0/);
    expect(errorsFor((c) => ((c.playlists[0].tracks[0] as Record<string, unknown>).recommenderId = 'nobody'))).toMatch(
      /No recommender/
    );
    expect(errorsFor((c) => (c.home.featuredPlaylistId = 'nope'))).toMatch(/home\.featuredPlaylistId/);
  });

  it('reserves the recruiter-mix playlist id', () => {
    expect(errorsFor((c) => (c.playlists[0].id = 'recruiter-mix'))).toMatch(/reserved/);
  });
});

describe('loader', () => {
  it('derives position and parent playlist for every track', () => {
    const runtime = buildRuntime(parseContent(example));
    const projects = runtime.allPlaylists.find((p) => p.id === 'featured-projects')!;
    expect(projects.tracks.map((t) => [t.number, t.playlistId])).toEqual([
      [1, 'featured-projects'],
      [2, 'featured-projects'],
      [3, 'featured-projects'],
    ]);
    expect(projects.trackCount).toBe(3);
  });

  it('always puts the virtual Recruiter Mix first', () => {
    expect(allPlaylists[0].id).toBe('recruiter-mix');
    expect(allPlaylists[0].tracks).toEqual([]);
  });

  it('uses content for the featured playlist and default theme', () => {
    expect(featuredPlaylist.id).toBe(portfolio.home.featuredPlaylistId);
    expect(defaultAccentThemeId).toBe(portfolio.accentThemes[0].id);
  });

  it('throws a readable error for invalid content', () => {
    const bad = clone(portfolio);
    bad.profile.email = 'not-an-email';
    expect(() => parseContent(bad)).toThrow(/profile\.email/);
  });
});

describe('AI engine with content-driven intents', () => {
  it('fills profile placeholders', () => {
    const profile = parseContent(example).profile;
    expect(fillTemplate('Mail {email} or call {phoneDisplay}, {firstName}', profile)).toBe(
      'Mail alex@example.com or call (555) 010-0000, Alex'
    );
  });

  it('answers from a draft config (as the dashboard test box will)', () => {
    const runtime = buildRuntime(parseContent(example));
    const config = {
      intents: runtime.aiConfig.intents,
      defaultAnswer: runtime.aiConfig.defaultAnswer,
      starterPrompts: runtime.starterPrompts,
      profile: runtime.candidateProfile,
      tracks: runtime.allPlaylists.flatMap((p) => p.tracks),
    };
    expect(processAIQuery('tell me about taskflow', config).referencedTrack?.id).toBe('project-taskflow');
    expect(processAIQuery('how do I contact you?', config).answer).toContain('alex@example.com');
    expect(processAIQuery('something unrelated', config).answer).toBe(
      "I'm Alex Rivera, a Full-Stack Engineer. Ask me about my projects, my experience, or how to get in touch!"
    );
  });
});
