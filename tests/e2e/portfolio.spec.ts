import { test, expect } from '@playwright/test';

test.describe('Spotify Desktop Portfolio - Core User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for React to attach handlers; in dev mode SSR HTML is clickable before it's interactive.
    await page.locator('html[data-hydrated="true"]').waitFor({ state: 'attached' });
  });

  test('E2E-01: 5-Zone Desktop Frame Renders Correctly', async ({ page }) => {
    await expect(page.locator('[data-testid="top-nav-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="left-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="center-stage"]')).toBeVisible();
    await expect(page.locator('[data-testid="right-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="bottom-player-bar"]')).toBeVisible();
  });

  test('E2E-02: Recruiter Mix Bookmarking and Modal Trigger', async ({ page }) => {
    // Navigate to Work Experience
    await page.locator('[data-testid="sidebar-playlist-work-experience"]').click();
    await expect(page.locator('[data-testid="playlist-title"]')).toHaveText('Work Experience');

    // Like Spotify, the save (+) button only appears while the row is hovered
    await page.locator('[data-testid="track-row-work-horquva"]').hover();
    const bookmarkBtn = page.locator('[data-testid="track-bookmark-btn-horquva"]');
    await bookmarkBtn.click();

    // Verify badge updates to at least 1
    const badge = page.locator('[data-testid="recruiter-mix-badge"]');
    await expect(badge).toHaveText('1');

    // Open Send Mix modal
    await page.locator('[data-testid="send-mix-pill-btn"]').click();
    await expect(page.locator('[data-testid="send-mix-modal"]')).toBeVisible();

    const textarea = page.locator('[data-testid="mix-summary-textarea"]');
    const textValue = await textarea.inputValue();
    expect(textValue).toContain('Horquva');
  });

  test('E2E-03: AI Search Popover with Starter Prompts and Response', async ({ page }) => {
    // Open AI Search popover via clicking search pill
    await page.locator('[data-testid="search-bar-pill"]').click();
    await expect(page.locator('[data-testid="ai-search-popover"]')).toBeVisible();

    // Click starter prompt
    await page.locator('[data-testid="starter-prompt-bizbuddy"]').click();

    // Verify AI response
    const aiMessage = page.locator('[data-testid="chat-message-ai"]');
    await expect(aiMessage).toBeVisible();
    await expect(aiMessage).toContainText('89%');
    await expect(aiMessage).toContainText('BizBuddy');

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="ai-search-popover"]')).not.toBeVisible();
  });

  test('E2E-04: Accent Theme Switcher Dynamically Swaps Colors', async ({ page }) => {
    await page.locator('[data-testid="settings-gear-btn"]').click();
    await expect(page.locator('[data-testid="theme-selector-popover"]')).toBeVisible();

    // Click purple swatch
    await page.locator('[data-testid="theme-swatch-purple"]').click();

    // Verify CSS variable updated
    const accentVar = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()
    );
    expect(accentVar).toBe('#8B5CF6');
  });

  test('E2E-05: Minimize Escape Hatch Navigates to Standard Resume Route', async ({ page }) => {
    const minimizeBtn = page.locator('[data-testid="minimize-escape-hatch"]');
    await minimizeBtn.hover();
    await expect(page.locator('[data-testid="escape-hatch-tooltip"]')).toHaveText(
      'Switch to Standard Resume View'
    );

    await minimizeBtn.click();
    await expect(page).toHaveURL(/\/resume/);
    await expect(page.locator('[data-testid="standard-resume-container"]')).toBeVisible();
  });

  test('E2E-06: Lyrics Mode Personal Cover Letter View', async ({ page }) => {
    await page.locator('[data-testid="lyrics-mic-btn"]').click();
    await expect(page.locator('[data-testid="lyrics-mode-stage"]')).toBeVisible();
    await expect(page.locator('[data-testid="lyrics-active-stanza"]')).toBeVisible();
  });

  test('E2E-07: Deep link opens a playlist and double-click plays a track in that context', async ({ page }) => {
    await page.goto('/#/playlist/work-experience');
    await expect(page.locator('[data-testid="playlist-title"]')).toHaveText('Work Experience');

    await page.locator('[data-testid="track-row-work-bizbuddy"]').dblclick();
    await expect(page.locator('[data-testid="right-sidebar"] h2')).toContainText('AI Automation Engineer');
    await expect(page.locator('[data-testid="bottom-play-btn"]')).toHaveAttribute('aria-label', 'Pause');

    await page.locator('[data-testid="track-row-work-horquva"]').click({ button: 'right' });
    await expect(page.locator('[data-testid="context-menu"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="context-menu"]')).toHaveCount(0);
  });

  test('E2E-08: Keyboard shortcuts dialog and Space play/pause', async ({ page }) => {
    await page.locator('[data-testid="center-stage"]').click({ position: { x: 20, y: 400 } });
    await page.keyboard.press('Space');
    await expect(page.locator('[data-testid="bottom-play-btn"]')).toHaveAttribute('aria-label', 'Pause');

    await page.keyboard.press('Control+/');
    await expect(page.locator('[data-testid="shortcuts-modal"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="shortcuts-modal"]')).toHaveCount(0);
  });
});
