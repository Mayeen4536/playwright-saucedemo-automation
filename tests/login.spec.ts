import { test, expect } from './fixtures';
import { standardUser, invalidLoginScenarios } from './test-data/loginData';
import { getEnvironmentConfig } from '../config/environments';

const { baseURL: baseUrl } = getEnvironmentConfig();

test.describe('Login', () => {
  test('valid user can login successfully', async ({ page, loginPage }) => {
    await loginPage.login(standardUser.username, standardUser.password);

    // Outcome, not implementation: user landed on inventory and sees products.
    await expect(page).toHaveURL(/inventory/);
    await expect(page.getByTestId('title')).toHaveText('Products');
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  for (const scenario of invalidLoginScenarios) {
    test(`shows an error for ${scenario.name}`, async ({ page, loginPage }) => {
      await loginPage.login(scenario.username, scenario.password);

      await expect(loginPage.errorMessage).toContainText(scenario.expectedError);
      // A failed login must not navigate away from the login page.
      await expect(page).toHaveURL(baseUrl);
    });
  }
});
