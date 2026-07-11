import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { loginAsStandardUser } from './utils/auth';

const baseUrl = 'https://www.saucedemo.com/';

// Login scenarios live in tests/login.spec.ts. Here login is only test setup.
test.describe('SauceDemo Automation Suite', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = await loginAsStandardUser(page);
  });

  test('user can add product to cart', async ({ page }) => {
    await expect(page).toHaveURL(/inventory/);

    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });

  test('user can remove product from cart', async ({ page }) => {
    await expect(page).toHaveURL(/inventory/);

    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="remove-sauce-labs-backpack"]');

    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });

  test('user can complete checkout flow', async ({ page }) => {
    await expect(page).toHaveURL(/inventory/);

    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');

    await page.fill('[data-test="firstName"]', 'Mayeen');
    await page.fill('[data-test="lastName"]', 'Sajid');
    await page.fill('[data-test="postalCode"]', '1216');

    await page.click('[data-test="continue"]');
    await expect(page.locator('.summary_info')).toBeVisible();

    await page.click('[data-test="finish"]');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  test('sorting products by price low to high works correctly', async ({ page }) => {
    await expect(page).toHaveURL(/inventory/);

    await page.selectOption('[data-test="product-sort-container"]', 'lohi');

    const prices = await page.locator('.inventory_item_price').allTextContents();
    const numericPrices = prices.map(price => Number(price.replace('$', '')));

    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    expect(numericPrices).toEqual(sortedPrices);
  });

  test('logout works successfully', async ({ page }) => {
    await expect(page).toHaveURL(/inventory/);

    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');

    await expect(page).toHaveURL(baseUrl);
    expect(await loginPage.isLoginPageDisplayed()).toBe(true);
  });
});