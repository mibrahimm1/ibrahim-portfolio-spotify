import { test, expect, type Page } from '@playwright/test';

/** Phone flows: run by the `mobile-*` projects (Pixel 7 and iPhone 14 emulation). */
const id = (testId: string) => `[data-testid="${testId}"]`;

async function open(page: Page, path = '/') {
  await page.goto(path);
  await page.locator('html[data-hydrated="true"]').waitFor({ state: 'attached' });
}

test.describe('Mobile app shell', () => {
  test.beforeEach(async ({ page }) => open(page));

  test('M-01: shows the phone chrome, not the desktop frame', async ({ page }) => {
    await expect(page.locator(id('m-tab-bar'))).toBeVisible();
    await expect(page.locator(id('m-mini-player'))).toBeVisible();
    await expect(page.locator(id('m-home-top'))).toBeVisible();
    await expect(page.locator(id('top-nav-bar'))).toBeHidden();
    await expect(page.locator(id('left-sidebar'))).toBeHidden();
    await expect(page.locator(id('bottom-player-bar'))).toBeHidden();
  });

  test('M-02: tabs switch between Home, Search, Library and Contact', async ({ page }) => {
    await page.locator(id('m-tab-search')).click();
    await expect(page.locator(id('browse-view'))).toBeVisible();
    await expect(page).toHaveURL(/#\/search$/);

    await page.locator(id('m-tab-library')).click();
    await expect(page.locator(id('library-view'))).toBeVisible();
    await expect(page).toHaveURL(/#\/library$/);

    await page.locator(id('m-tab-contact')).click();
    await expect(page.locator(id('contact-view'))).toBeVisible();

    await page.locator(id('m-tab-home')).click();
    await expect(page.locator(id('m-home-top'))).toBeVisible();
  });

  test('M-03: the mini-player opens the full player, which closes again', async ({ page }) => {
    await page.locator(id('m-mini-player')).click();
    const full = page.locator(id('m-full-player'));
    await expect(full).toBeVisible();
    await expect(page.locator(id('m-mini-player'))).toBeHidden();
    await page.locator(id('m-full-player-close')).click();
    await expect(full).toBeHidden();
    await expect(page.locator(id('m-mini-player'))).toBeVisible();
  });

  test('M-04: tapping a row plays it; "…" opens the bottom sheet', async ({ page }) => {
    await page.locator(id('m-tab-library')).click();
    await page.locator(id('library-row-work-experience')).click();
    await expect(page.locator(id('playlist-title'))).toHaveText('Work Experience');

    await page.locator(id('track-row-work-horquva')).getByRole('button', { name: /^Play / }).click();
    await expect(page.locator(id('m-mini-player'))).toContainText('Horquva');

    await page.locator(id('track-more-work-horquva')).click();
    const sheet = page.getByRole('menu');
    await expect(sheet).toBeVisible();
    await sheet.getByText('Save to Your Recruiter Mix').click();
    await expect(sheet).toBeHidden();
  });

  test('M-05: Back closes a sheet first, then goes back a page', async ({ page }) => {
    await page.locator(id('m-tab-library')).click();
    await page.locator(id('library-row-featured-projects')).click();
    await expect(page.locator(id('playlist-title'))).toHaveText('Featured Projects');

    await page.locator(id('m-mini-player')).click();
    await expect(page.locator(id('m-full-player'))).toBeVisible();

    await page.goBack();
    await expect(page.locator(id('m-full-player'))).toBeHidden();
    await expect(page.locator(id('playlist-title'))).toHaveText('Featured Projects');

    await page.goBack();
    await expect(page.locator(id('library-view'))).toBeVisible();
  });

  test('M-06: Search asks the AI from the full-screen search', async ({ page }) => {
    await page.locator(id('m-tab-search')).click();
    await page.locator(id('m-search-field')).click();
    await expect(page.locator(id('m-search'))).toBeVisible();
    await page.locator('#mobile-search-input').fill('What does he build?');
    await page.locator(id('ask-ai-row')).click();
    await expect(page.locator(id('chat-message-ai')).first()).toBeVisible();
  });

  test('M-07: Library chips filter the list', async ({ page }) => {
    await page.locator(id('m-tab-library')).click();
    await page.getByRole('tab', { name: 'Stack' }).click();
    await expect(page.locator('[data-testid^="library-row-tech:"]').first()).toBeVisible();
    await expect(page.locator(id('library-row-work-experience'))).toHaveCount(0);
  });

  test('M-08: Contact opens the Send Mix sheet full screen', async ({ page }) => {
    await page.locator(id('m-tab-contact')).click();
    await page.locator(id('m-send-mix')).click();
    await expect(page.locator(id('send-mix-modal'))).toBeVisible();
    await page.goBack();
    await expect(page.locator(id('send-mix-modal'))).toBeHidden();
    await expect(page.locator(id('contact-view'))).toBeVisible();
  });

  test('M-09: the avatar opens the profile drawer', async ({ page }) => {
    await page.locator(id('m-avatar')).click();
    await expect(page.locator(id('m-profile-drawer'))).toBeVisible();
    await expect(page.locator(id('m-standard-resume'))).toBeVisible();
  });
});

test('M-10: no horizontal scroll at 360px on any page', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const hash of ['', '#/search', '#/library', '#/contact', '#/playlist/featured-projects', '#/playlist/work-experience', '#/recruiter-mix', '#/lyrics']) {
    await open(page, `/${hash}`);
    const widths = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      main: document.querySelector('main')?.scrollWidth ?? 0,
    }));
    expect(widths.doc, hash).toBeLessThanOrEqual(360);
    expect(widths.main, hash).toBeLessThanOrEqual(360);
  }
});
