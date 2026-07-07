import { test, expect } from '@playwright/test';

const baseUrl = 'https://www.saucedemo.com/';
const username = 'standard_user';
const password = 'secret_sauce';

async function login(page) {
  await page.goto(baseUrl);
  await page.fill('#user-name', username);
  await page.fill('#password', password);
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);
}

test.describe('SauceDemo Automation Suite', () => {
  test('valid user can login successfully', async ({ page }) => {
    await login(page);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('locked out user cannot login', async ({ page }) => {
    await page.goto(baseUrl);
    await page.fill('#user-name', 'locked_out_user');
    await page.fill('#password', password);
    await page.click('#login-button');

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Sorry, this user has been locked out'
    );
  });

  test('user can add product to cart', async ({ page }) => {
    await login(page);

    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });

  test('user can remove product from cart', async ({ page }) => {
    await login(page);

    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="remove-sauce-labs-backpack"]');

    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });

  test('user can complete checkout flow', async ({ page }) => {
    await login(page);

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
    await login(page);

    await page.selectOption('[data-test="product-sort-container"]', 'lohi');

    const prices = await page.locator('.inventory_item_price').allTextContents();
    const numericPrices = prices.map(price => Number(price.replace('$', '')));

    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    expect(numericPrices).toEqual(sortedPrices);
  });

  test('logout works successfully', async ({ page }) => {
    await login(page);

    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');

    await expect(page).toHaveURL(baseUrl);
    await expect(page.locator('#login-button')).toBeVisible();
  });
});