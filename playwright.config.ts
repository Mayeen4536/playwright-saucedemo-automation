import { defineConfig } from '@playwright/test';
import { getEnvironmentConfig } from './config/environments';
import { getApiEnvironmentConfig } from './config/apiEnvironments';
import { authFile } from './config/auth';

// Resolved eagerly so an unknown TEST_ENV fails the run immediately,
// before any test file is even loaded.
const { baseURL } = getEnvironmentConfig();
const { apiBaseURL } = getApiEnvironmentConfig();

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    headless: true,
    baseURL,
    // Map getByTestId() to SauceDemo's own data-test attributes (default is data-testid).
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
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