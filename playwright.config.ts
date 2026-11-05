import { defineConfig, devices } from '@playwright/test';

// The site tests run against the real production output: the static export in out/,
// served with the headers from out/_headers (so the CSP is enforced during the tests).
// The dashboard only exists under `next dev`, so its tests use the dev server.
const SITE = 'http://127.0.0.1:4173';
const DEV = 'http://127.0.0.1:3000';

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
      testMatch: /mobile\.spec\.ts/,
    },
    {
      // iPhone viewport, touch and user agent, run in Chromium so WebKit needn't be installed.
      name: 'mobile-ios',
      use: { ...devices['iPhone 14'], defaultBrowserType: 'chromium' },
      testMatch: /mobile\.spec\.ts/,
    },
    {
      name: 'dashboard',
      use: { ...devices['Desktop Chrome'], baseURL: DEV },
      testMatch: /dashboard\.spec\.ts/,
    },
  ],
  webServer: [
    {
      // Locally an already-running preview is reused: run `npm run build` first to test fresh code.
      command: 'npm run build && npm run preview',
      url: SITE,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
    {
      command: 'npm run dev',
      url: DEV,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
