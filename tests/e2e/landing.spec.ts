import { test, expect, type Page } from '@playwright/test';
import fixture from '../fixtures/portfolio.json';

/** The standard portfolio page at /resume. Runs in the desktop and both phone projects. */
const id = (testId: string) => `[data-testid="${testId}"]`;

async function open(page: Page) {
  await page.goto('/resume/');
  await page.locator('html[data-hydrated="true"], [data-landing]').first().waitFor();
  await page.waitForLoadState('networkidle');
}

test.describe('Standard portfolio (/resume)', () => {
  test('L-01: the hero headline rotates through the configured phrases', async ({ page }) => {
    await open(page);
    await expect(page.locator('#hero-title .sr-only')).toContainText(fixture.landing.heroPrefix);
    const active = page.locator(`${id('landing-rotator')} [data-active]`);
    await expect(active).toHaveText(fixture.landing.rotatingPhrases[0]);
    await expect(active).toHaveText(fixture.landing.rotatingPhrases[1], { timeout: 6000 });
  });

  test('L-02: Book a call opens the booking link in a new tab', async ({ page }) => {
    await open(page);
    const book = page.locator(id('landing-book-call'));
    await expect(book).toHaveAttribute('href', fixture.profile.calendarBookingUrl);
    await expect(book).toHaveAttribute('target', '_blank');
    await expect(book).toHaveAttribute('rel', /noopener/);
  });

  test('L-03: project rows show a cursor preview with a mouse, and none on touch', async ({ page, isMobile }) => {
    await open(page);
    const list = page.locator(id('landing-project-list'));
    await list.scrollIntoViewIfNeeded();
    const preview = page.locator(id('landing-project-preview'));
    if (isMobile) {
      await expect(preview).toHaveCount(0);
      return;
    }
    await list.locator('a').first().hover();
    await expect(preview).toHaveAttribute('data-visible', 'true');
    await page.mouse.move(5, 5);
    await expect(preview).not.toHaveAttribute('data-visible', 'true');
  });

  test('L-04: an experience row expands to the full story', async ({ page }) => {
    await open(page);
    const first = fixture.playlists.find((p) => p.id === 'work-experience')!.tracks[0];
    const row = page.locator(id(`landing-role-${first.id}`));
    await row.scrollIntoViewIfNeeded();
    await row.focus();
    await page.keyboard.press('Enter');
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    const panel = page.locator(`[id="${await row.getAttribute('aria-controls')}"]`);
    await expect(panel.getByText(first.details.slice(0, 40))).toBeVisible();
  });

  test('L-05: copying the email confirms it', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await open(page);
    const button = page.locator(id('landing-copy-email'));
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await expect(button.locator('[aria-live]')).toHaveText('Email address copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(fixture.profile.email);
  });

  test('L-06: no horizontal scroll at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 760 });
    await open(page);
    const widths = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: document.documentElement.clientWidth }));
    expect(widths.doc).toBeLessThanOrEqual(widths.view);
  });

  test('L-07: printing gives the compact résumé, without the posters or menus', async ({ page }) => {
    await open(page);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('[data-print-only]')).toBeVisible();
    await expect(page.locator('[data-print-only] h1')).toHaveText(fixture.profile.name);
    await expect(page.locator('[data-screen-only]')).toBeHidden();
    await page.emulateMedia({ media: 'screen' });
    await expect(page.locator('[data-print-only]')).toBeHidden();
  });

  test('L-08: with reduced motion the headline holds still', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const active = page.locator(`${id('landing-rotator')} [data-active]`);
    await expect(active).toHaveText(fixture.landing.rotatingPhrases[0]);
    await page.waitForTimeout(3500);
    await expect(active).toHaveText(fixture.landing.rotatingPhrases[0]);
  });

  test('L-09: scrolling to the end reveals every section (nothing stays hidden)', async ({ page }) => {
    await open(page);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 500) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(400);
    // Allow for the last row of a horizontal strip that is still off to the side.
    const pending = await page.locator('[data-reveal][data-state="pending"]').evaluateAll((els) =>
      els.filter((e) => {
        const r = e.getBoundingClientRect();
        return r.left < window.innerWidth && r.right > 0;
      }).length
    );
    expect(pending).toBe(0);
    await expect(page.locator('#contact h2')).toHaveText(fixture.landing.contactHeading);
  });

  test('L-10: links back to the interactive version', async ({ page }) => {
    await open(page);
    await expect(page.locator('footer a[href="/"]')).toHaveCount(1);
  });
});
