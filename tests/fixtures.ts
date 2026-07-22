import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { collectBrowserDiagnostics, hasEvidence } from './diagnostics';

type Fixtures = {
  loginPage: LoginPage;
  // Auto fixture — collects evidence for every test, nothing to destructure.
  browserDiagnostics: void;
};

/**
 * Custom test extending Playwright's base test with a `loginPage` fixture.
 * The fixture only navigates to the login page — it does NOT log in.
 * Tests decide which credentials to submit and what to assert.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  // Runs for every test automatically (auto: true) — evidence collection,
  // not a new assertion policy: it never fails a test, and it only attaches
  // to the Playwright report when the test itself already didn't pass.
  browserDiagnostics: [
    async ({ page }, use, testInfo) => {
      const diagnostics = collectBrowserDiagnostics(page);

      await use();

      if (testInfo.status !== 'passed' && hasEvidence(diagnostics)) {
        await testInfo.attach('browser-diagnostics', {
          body: JSON.stringify(diagnostics, null, 2),
          contentType: 'application/json',
        });
      }
    },
    { auto: true },
  ],
});

export { expect };
