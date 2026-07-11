import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type LoginFixtures = {
  loginPage: LoginPage;
};

/**
 * Custom test extending Playwright's base test with a `loginPage` fixture.
 * The fixture only navigates to the login page — it does NOT log in.
 * Tests decide which credentials to submit and what to assert.
 */
export const test = base.extend<LoginFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
});

export { expect };
