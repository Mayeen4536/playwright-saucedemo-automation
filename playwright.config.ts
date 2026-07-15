import { defineConfig } from '@playwright/test';
import { getEnvironmentConfig } from './config/environments';

// Resolved eagerly so an unknown TEST_ENV fails the run immediately,
// before any test file is even loaded.
const { baseURL } = getEnvironmentConfig();

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
});