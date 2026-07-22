import { defineConfig } from '@playwright/test';
import { getEnvironmentConfig } from './config/environments';
import { getApiEnvironmentConfig } from './config/apiEnvironments';
import { authFile } from './config/auth';

// Resolved eagerly so an unknown TEST_ENV fails the run immediately,
// before any test file is even loaded.
const { baseURL } = getEnvironmentConfig();
const { apiBaseURL } = getApiEnvironmentConfig();

// GitHub Actions sets CI=true automatically — no workflow change needed for
// this to take effect there. Always false/unset in local development.
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  // Zero locally: every pass is a genuine first-attempt pass while iterating,
  // and a failure is never masked by a second try. One retry in CI absorbs a
  // single transient blip (slow runner, network hiccup) — it is not a way to
  // make a genuinely flaky test acceptable; Playwright's reporters still
  // track and surface a distinct "flaky" count for any test that only passed
  // after a retry, and that count is what should get investigated, not hidden.
  retries: isCI ? 1 : 0,
  use: {
    headless: true,
    baseURL,
    // Map getByTestId() to SauceDemo's own data-test attributes (default is data-testid).
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Retained on failure regardless of whether a retry happens (unlike
    // 'on-first-retry', which never fires locally since retries is 0 there).
    // Discarded for every passing test, so cost stays proportional to actual
    // failures rather than the full suite.
    trace: 'retain-on-failure',
  },
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  projects: [
    {
      // Produces playwright/.auth/standard-user.json. Not applied to any
      // other project directly — 'authenticated' depends on it below.
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      // Login tests must exercise the real form every time, so this
      // project has no storageState — every test starts logged out.
      name: 'unauthenticated',
      testMatch: /login\.spec\.ts/,
    },
    {
      // Only this project loads the saved session, and only for the
      // feature tests that require an authenticated user as a precondition.
      name: 'authenticated',
      testMatch: /saucedemo\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: authFile,
      },
    },
    {
      // Independent API-contract tests (tests/api/) against restful-booker.
      // Uses only the `request` fixture — no browser, no storageState, and
      // its own baseURL, unrelated to SauceDemo's UI projects above.
      name: 'api',
      testMatch: /\.api\.spec\.ts$/,
      use: {
        baseURL: apiBaseURL,
      },
    },
  ],
});