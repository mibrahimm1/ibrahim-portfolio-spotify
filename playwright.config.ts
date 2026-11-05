import { defineConfig, devices } from '@playwright/test';

// Everything runs on the fixed test content (tests/fixtures/portfolio.json), so the suite
// passes whatever your own content/portfolio.json says.
//
// - Site tests: a real production build of that content (exported to out-e2e/, never your
//   deployable out/), served with its _headers, so the CSP is enforced during the tests.
// - Dashboard tests: a dev server on its own port; their edits go to the fixture file and
//   are undone afterwards.
const SITE = 'http://127.0.0.1:4174';
const DEV = 'http://127.0.0.1:3100';
const TEST_CONTENT = { PORTFOLIO_CONTENT: 'tests/fixtures/portfolio.json' };

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: SITE,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /(dashboard|mobile)\.spec\.ts/,
    },
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 7'] },
      testMatch: /(mobile|landing)\.spec\.ts/,
    },
    {
      // iPhone viewport, touch and user agent, run in Chromium so WebKit needn't be installed.
      name: 'mobile-ios',
      use: { ...devices['iPhone 14'], defaultBrowserType: 'chromium' },
      testMatch: /(mobile|landing)\.spec\.ts/,
    },
    {
      name: 'dashboard',
      use: { ...devices['Desktop Chrome'], baseURL: DEV },
      testMatch: /dashboard\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: 'npm run build && npm run preview',
      env: { ...TEST_CONTENT, PORT: '4174' },
      url: SITE,
      // Locally a test preview that's still running is reused (stop it to rebuild).
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
    {
      command: 'npx next dev -H 127.0.0.1 -p 3100',
      env: TEST_CONTENT,
      url: DEV,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
