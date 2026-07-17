import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { standardUser } from './test-data/loginData';
import { authFile } from '../config/auth';

// Not a business test: this produces a storageState file that the
// 'authenticated' project depends on (see playwright.config.ts). It has no
// pass/fail meaning of its own beyond "did we obtain a valid session".
setup('authenticate as standard user', async ({ page }) => {
  if (!standardUser.username || !standardUser.password) {
    throw new Error(
      'Missing standard_user credentials in tests/test-data/loginData.ts — cannot generate authenticated storage state.'
    );
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(standardUser.username, standardUser.password);
  await page.waitForURL(/inventory/);

  await page.context().storageState({ path: authFile });
});
