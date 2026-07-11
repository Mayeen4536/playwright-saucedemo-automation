import { type Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const standardUsername = 'standard_user';
const standardPassword = 'secret_sauce';

/**
 * Logs in as the standard SauceDemo user via LoginPage and returns the
 * instance so callers can still use its locators/state helpers afterwards.
 * No assertions here — callers decide what to verify.
 */
export async function loginAsStandardUser(page: Page): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(standardUsername, standardPassword);
  return loginPage;
}
