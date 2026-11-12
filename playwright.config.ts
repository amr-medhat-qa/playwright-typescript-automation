import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export const UI_BASE_URL = process.env.UI_BASE_URL ?? 'https://www.saucedemo.com';
export const API_BASE_URL = process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : 6, // capped locally: running every project at once overloads Firefox
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ...(isCI
      ? ([['github'], ['list'], ['blob']] as const) // each CI job's blob report is merged into one HTML report
      : ([['list'], ['html', { open: 'never' }]] as const)),
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        environmentInfo: {
          UI_BASE_URL,
          API_BASE_URL,
          Node: process.version,
          OS: process.platform,
        },
      },
    ],
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL, testIdAttribute: 'data-test' },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], baseURL: UI_BASE_URL, testIdAttribute: 'data-test' },
    },
    {
      name: 'a11y',
      testDir: './tests/a11y',
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL, testIdAttribute: 'data-test' },
    },
    {
      // Baselines are generated on Linux (CI) so screenshots are compared on the same OS/fonts
      name: 'visual',
      testDir: './tests/visual',
      snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
      // Small absolute tolerance: absorbs anti-aliasing noise but catches a changed price or icon
      expect: { toHaveScreenshot: { maxDiffPixels: 50, animations: 'disabled' } },
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
        testIdAttribute: 'data-test',
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  ],
});
