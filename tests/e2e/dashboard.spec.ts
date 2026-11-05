import { test, expect, APIRequestContext } from '@playwright/test';

// The dashboard only exists under `npm run dev`. Against a production server these tests
// skip themselves, and a separate check asserts the routes really are missing there.
// They edit the test content (tests/fixtures/portfolio.json), so the original is saved
// first and restored after.

const API = '/api/dev-dashboard';
const HEADERS = { 'x-portfolio-dashboard': '1' };

let original: unknown = null;

async function dashboardAvailable(request: APIRequestContext) {
  const res = await request.get(`${API}/content`, { headers: HEADERS });
  return res.status() === 200 ? ((await res.json()) as { content: unknown }) : null;
}

test.describe.configure({ mode: 'serial' });

test.describe('Content dashboard (dev only)', () => {
  test.beforeAll(async ({ request }) => {
    const data = await dashboardAvailable(request);
    original = data?.content ?? null;
  });

  test.afterAll(async ({ request }) => {
    if (original) {
      const res = await request.put(`${API}/content`, { headers: { ...HEADERS, 'Content-Type': 'application/json' }, data: { content: original, force: true } });
      expect(res.status()).toBe(200);
    }
  });

  test.beforeEach(async () => {
    test.skip(!original, 'Dashboard API not available (production server)');
  });

  test('DASH-01: edit a title, save, and see it on the site', async ({ page, request }) => {
    await page.goto('/dashboard#playlists');
    await page.getByRole('button', { name: /Featured Projects/ }).first().click();
    await page.getByRole('button', { name: /^Konvex/ }).first().click();

    const title = page.getByRole('textbox', { name: 'Title', exact: true }).nth(1);
    await title.fill('Konvex (edited in dashboard)');
    await expect(page.getByTestId('dashboard-status')).toHaveText('Unsaved changes');

    await page.keyboard.press('Control+s');
    await expect(page.getByTestId('dashboard-status')).toHaveText('All changes saved', { timeout: 15_000 });

    const saved = (await (await request.get(`${API}/content`, { headers: HEADERS })).json()) as {
      content: { playlists: { tracks: { id: string; title: string }[] }[] };
    };
    const konvex = saved.content.playlists.flatMap((p) => p.tracks).find((t) => t.id === 'project-konvex');
    expect(konvex?.title).toBe('Konvex (edited in dashboard)');

    await page.goto('/#/playlist/featured-projects');
    await expect(page.getByTestId('track-row-project-konvex')).toContainText('Konvex (edited in dashboard)', { timeout: 20_000 });
  });

  test('DASH-02: an unsafe link blocks saving', async ({ page }) => {
    await page.goto('/dashboard#profile');
    const github = page.getByRole('textbox', { name: 'GitHub' });
    await github.fill('javascript:alert(1)');
    await expect(page.getByTestId('dashboard-status')).toHaveText('1 problem to fix');
    await expect(page.getByTestId('dashboard-save')).toBeDisabled();
    await expect(page.getByText('Use a full https:// link (or mailto: / tel:)')).toBeVisible();
  });

  test('DASH-03: deleting an item lists where it is used', async ({ page }) => {
    await page.goto('/dashboard#playlists');
    await page.getByRole('button', { name: /Featured Projects/ }).first().click();
    await page.getByRole('button', { name: 'Delete item' }).first().click();
    const dialog = page.getByTestId('dashboard-confirm');
    await expect(dialog).toContainText('It is used in 4 places');
    await expect(dialog).toContainText('needs a replacement');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('DASH-04: the API refuses requests without the dashboard header', async ({ request }) => {
    expect((await request.get(`${API}/content`)).status()).toBe(403);
    expect((await request.put(`${API}/content`, { data: { content: {} } })).status()).toBe(403);
  });
});
