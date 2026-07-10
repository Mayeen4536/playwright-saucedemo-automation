import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const baseUrl = 'https://www.saucedemo.com/';
const validUsername = 'standard_user';
const validPassword = 'secret_sauce';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('valid user can login successfully', async ({ page }) => {
    await loginPage.login(validUsername, validPassword);

    // Outcome, not implementation: user landed on inventory and sees products.
    await expect(page).toHaveURL(/inventory/);
    await expect(page.getByTestId('title')).toHaveText('Products');
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('invalid credentials show an error message', async ({ page }) => {
    await loginPage.login('invalid_user', 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match any user in this service'
    );
    // A failed login must not navigate away from the login page.
    await expect(page).toHaveURL(baseUrl);
  });

  test('locked out user cannot login', async ({ page }) => {
    await loginPage.login('locked_out_user', validPassword);

    await expect(loginPage.errorMessage).toContainText(
      'Sorry, this user has been locked out'
    );
    await expect(page).toHaveURL(baseUrl);
  });

  test('empty username shows a validation error', async ({ page }) => {
    await loginPage.login('', validPassword);

    await expect(loginPage.errorMessage).toContainText('Username is required');
    await expect(page).toHaveURL(baseUrl);
  });

  test('empty password shows a validation error', async ({ page }) => {
    await loginPage.login(validUsername, '');

    await expect(loginPage.errorMessage).toContainText('Password is required');
    await expect(page).toHaveURL(baseUrl);
  });

  test('empty credentials show a validation error', async ({ page }) => {
    await loginPage.login('', '');

    // SauceDemo reports the first missing field only.
    await expect(loginPage.errorMessage).toContainText('Username is required');
    await expect(page).toHaveURL(baseUrl);
  });
});
