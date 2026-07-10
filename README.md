# SauceDemo Playwright Automation

End-to-end UI test suite for [SauceDemo](https://www.saucedemo.com/), built with
[Playwright](https://playwright.dev/) and TypeScript. The project is structured with
the **Page Object Model (POM)** and follows Playwright's locator best practices.

## Tech stack

- Playwright Test (`@playwright/test`)
- TypeScript
- GitHub Actions CI

## Project structure

```
saucedemo-playwright/
├── pages/                  # Page Objects (locators + actions + state helpers)
│   └── LoginPage.ts
├── tests/                  # Test specs (all assertions live here)
│   └── saucedemo.spec.ts
├── playwright.config.ts    # Config (testIdAttribute, reporters, retries, etc.)
├── package.json
└── .github/workflows/      # CI pipeline
```

## Design conventions

- **Page Objects hold locators, actions, and state** (e.g. `isLoginPageDisplayed()`,
  `getLoginErrorMessage()`). They do **not** contain `expect()` assertions.
- **Tests own all assertions.** This keeps page objects reusable and tests readable.
- **Locator hierarchy:** prefer `getByRole` / `getByLabel` / `getByPlaceholder`, then
  `getByTestId`, and use raw CSS/XPath only as a last resort.
- `testIdAttribute` is set to `data-test` in `playwright.config.ts` so
  `getByTestId('...')` maps to SauceDemo's own attributes.

## Getting started

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install
```

## Running tests

```bash
npm test                 # run the full suite (headless)
npm run test:headed      # run in a visible browser
npm run test:report      # open the last HTML report
```

Or directly:

```bash
npx playwright test
npx playwright test --headed
npx playwright test tests/saucedemo.spec.ts
```

## Verifying the framework

```bash
npx playwright test          # all specs should pass
npx playwright test --list   # list discovered tests without running them
```

## Coverage

The suite covers login (valid and locked-out), add/remove from cart, full checkout,
price sorting, and logout.
