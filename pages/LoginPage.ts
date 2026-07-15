import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object for the SauceDemo login page.
 *
 * Design rule: this class exposes locators and state (booleans, strings).
 * It does NOT contain expect() assertions — the tests decide what to assert.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Preferred tier — role-based. The submit button derives its accessible
    // name ("Login") from its value attribute, so we find it the way a user
    // or a screen reader would, not via an internal id.
    this.loginButton = page.getByRole('button', { name: 'Login' });

    // The inputs have no <label>, so the placeholder is the most stable,
    // user-visible handle available (one step above raw CSS/id).
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');

    // The error banner has no meaningful role or name. SauceDemo ships a
    // dedicated data-test hook for it, which is the sanctioned automation
    // attribute (mapped via testIdAttribute in playwright.config.ts).
    this.errorMessage = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    // Relative — resolves against the configured baseURL (see playwright.config.ts),
    // so this page object works unchanged against any configured environment.
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Returns whether the login page is currently displayed.
   * Returns state only — the test decides whether that state is expected.
   */
  async isLoginPageDisplayed(): Promise<boolean> {
    return this.loginButton.isVisible();
  }

  /**
   * Returns the login error text (trimmed), or an empty string if none.
   * The underlying locator query waits for the element to attach to the DOM.
   */
  async getLoginErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent())?.trim() ?? '';
  }
}
