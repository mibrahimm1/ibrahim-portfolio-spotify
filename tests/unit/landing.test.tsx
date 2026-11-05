import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../fixtures/portfolio.json';
import { PortfolioSchema } from '@/content/schema';
import { buildRuntime } from '@/data/portfolioData';
import { parseContent } from '@/data/validateContent';
import { buildLanding, companyOf, defaultQuote, posterFor, splitFigure } from '@/lib/landing';
import { WordRotator } from '@/components/landing/motion/Animated';
import { Work } from '@/components/landing/Work';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const landingFor = (mutate?: (c: typeof fixture) => void) => {
  const content = clone(fixture);
  mutate?.(content);
  return buildLanding(buildRuntime(parseContent(content)));
};

function setMedia(matching: string[]) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: matching.some((m) => query.includes(m)),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }),
  });
}

afterEach(() => {
  setMedia([]);
  vi.useRealTimers();
});

describe('landing model', () => {
  it('uses the configured hero, posters and contact copy', () => {
    const l = landingFor();
    expect(l.heroPrefix).toBe(fixture.landing.heroPrefix);
    expect(l.rotatingPhrases).toEqual(fixture.landing.rotatingPhrases);
    expect(l.featured.map((t) => t.id)).toEqual(fixture.landing.featuredProjectIds);
    expect(l.moreProjects.some((t) => fixture.landing.featuredProjectIds.includes(t.id))).toBe(false);
    expect(l.timeZone).toBe('Asia/Karachi');
    expect(l.contactHeading).toBe(fixture.landing.contactHeading);
  });

  it('falls back to sensible defaults when `landing` is missing (forks)', () => {
    const l = landingFor((c) => {
      delete (c as { landing?: unknown }).landing;
      c.recommenders.forEach((r) => delete (r as { quote?: string }).quote);
    });
    expect(l.heroPrefix).toBe('I build');
    expect(l.rotatingPhrases.length).toBeGreaterThan(0);
    expect(l.rotatingPhrases[0]).toBe(fixture.technologies[0].category.toLowerCase());
    expect(l.featured).toHaveLength(4);
    expect(l.contactHeading).toBe('Have something in mind?');
    expect(l.contactLine).toBe(fixture.profile.availabilityLine);
    expect(l.timeZone).toBeUndefined();
    // Quotes come from the letter's second paragraph when none is set.
    expect(l.testimonials[0].quote).toBe(defaultQuote(fixture.recommenders[0].fullLetter));
  });

  it('derives the sections from resume.sections and leaves the rest for "Beyond work"', () => {
    const l = landingFor();
    expect(l.experience.length).toBeGreaterThan(0);
    expect(l.companies).toContain(companyOf(l.experience[0]));
    expect(l.beyondWork.every((t) => t.playlistId === 'volunteering-leadership')).toBe(true);
  });

  it('builds a poster (figure, claim, colours) for every project', () => {
    const l = landingFor();
    for (const t of [...l.featured, ...l.moreProjects]) {
      const p = posterFor(t);
      expect(p.figure.length).toBeGreaterThan(0);
      expect(p.from).toMatch(/^#[0-9a-f]{6}$/i);
      expect(p.to).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('text helpers', () => {
  it.each([
    ['89% Fewer Hallucinations', '89%', 'Fewer Hallucinations'],
    ['14,000+ Chest X-Rays', '14,000+', 'Chest X-Rays'],
    ['1st Place Among 20+ Teams', '1st', 'Place Among 20+ Teams'],
    ['Top 5% of Students', 'Top 5%', 'of Students'],
    ['Visual Identity Overhaul', 'Visual Identity Overhaul', ''],
  ])('splitFigure(%s)', (input, figure, claim) => {
    expect(splitFigure(input)).toEqual({ figure, claim });
  });

  it('companyOf strips the location', () => {
    expect(companyOf({ subtitle: 'Horquva LLC · Remote (US)' } as never)).toBe('Horquva LLC');
  });

  it('defaultQuote prefers the second paragraph and caps the length', () => {
    expect(defaultQuote(['I am writing to recommend.', 'She is brilliant. More text.'])).toBe('She is brilliant.');
    expect(defaultQuote(['Only one paragraph here.'])).toBe('Only one paragraph here.');
    expect(defaultQuote(['x', `${'a'.repeat(300)}.`]).length).toBeLessThanOrEqual(240);
  });
});

describe('landing schema rules', () => {
  const errors = (mutate: (c: typeof fixture) => void) => {
    const c = clone(fixture);
    mutate(c);
    const r = PortfolioSchema.safeParse(c);
    return r.success ? [] : r.error.issues.map((i) => i.path.join('.'));
  };

  it('accepts content without a landing section', () => {
    expect(errors((c) => delete (c as { landing?: unknown }).landing)).toEqual([]);
  });

  it('rejects an unknown poster project and an invalid time zone', () => {
    expect(errors((c) => (c.landing.featuredProjectIds = ['no-such-track']))).toContain('landing.featuredProjectIds.0');
    expect(errors((c) => (c.landing.timeZone = 'Mars/Olympus'))).toContain('landing.timeZone');
  });
});

describe('motion components', () => {
  it('WordRotator advances on a timer and holds still under reduced motion', () => {
    vi.useFakeTimers();
    const words = ['alpha', 'beta', 'gamma'];
    const active = () => document.querySelector('[data-active]')?.textContent;

    const { unmount } = render(<WordRotator words={words} interval={1000} />);
    expect(active()).toBe('alpha');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(active()).toBe('beta');
    unmount();

    setMedia(['prefers-reduced-motion']);
    render(<WordRotator words={words} interval={1000} />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(active()).toBe('alpha');
  });

  it('is decorative: the rotator is hidden from screen readers', () => {
    render(<WordRotator words={['a', 'b']} />);
    expect(screen.getByTestId('landing-rotator')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders no cursor preview on touch screens', () => {
    setMedia([]); // no fine pointer
    render(<Work />);
    expect(screen.getByTestId('landing-project-list')).toBeInTheDocument();
    expect(screen.queryByTestId('landing-project-preview')).toBeNull();
  });

  it('renders the cursor preview with a mouse', () => {
    setMedia(['hover: hover']);
    render(<Work />);
    expect(screen.getByTestId('landing-project-preview')).toBeInTheDocument();
  });
});
