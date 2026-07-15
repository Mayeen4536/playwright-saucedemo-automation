# SauceDemo Playwright Automation

End-to-end UI test suite for [SauceDemo](https://www.saucedemo.com/), built with
[Playwright](https://playwright.dev/) and TypeScript, structured with the
**Page Object Model (POM)** and following Playwright's locator best practices.

---

## Project Overview

This repository automates the core user journeys of the SauceDemo web application —
a demo e-commerce site widely used to practice UI automation. It is a portfolio
project that demonstrates a clean, maintainable, and scalable test architecture rather
than a throwaway script.

The framework is deliberately built in small, reviewable increments, each one applying
a specific automation best practice: Page Object Model, a disciplined locator strategy,
and a strict separation between *interaction logic* (page objects) and *verification*
(tests).

**Currently covered flows:** login (valid user, invalid credentials, locked-out user,
and empty-field validations), adding and removing products from the cart, the full
checkout journey, product sorting by price, and logout.

---

## Features

- **Page Object Model (POM)** — each page's locators and actions live in one class.
- **Best-practice locators** — user-facing strategies (`getByRole`, `getByPlaceholder`)
  preferred over brittle CSS/`id` selectors.
- **Clean separation of concerns** — page objects expose locators, actions, and state;
  tests own every assertion.
- **State helper methods** — e.g. `isLoginPageDisplayed()`, `getLoginErrorMessage()`.
- **Auto-waiting & web-first assertions** — no fixed `sleep`/`waitForTimeout` calls.
- **Configurable test IDs** — `testIdAttribute` mapped to SauceDemo's `data-test` hooks.
- **Custom Playwright fixture** — `tests/fixtures.ts` extends the base `test` with a
  `loginPage` fixture (via `test.extend()`) that provides a ready-to-use `LoginPage`
  without auto-logging in, so tests choose their own credentials and outcome.
- **Typed, data-driven login tests** — `tests/test-data/loginData.ts` defines reusable
  login accounts and negative-scenario data with explicit TypeScript types; negative
  login tests are generated from that data instead of being hand-duplicated.
- **Rich reporting** — list + HTML reporters, with screenshots, video, and traces
  captured on failure.
- **Continuous Integration** — GitHub Actions runs the suite on every push to `main`,
  on a schedule (every 3 hours), and on demand, and uploads the HTML report as an artifact.

---

## Folder Structure

```
saucedemo-playwright/
├── pages/                        # Page Objects (locators + actions + state helpers)
│   └── LoginPage.ts
├── tests/                        # Test specs (all assertions live here)
│   ├── fixtures.ts               # Custom test.extend() — provides the loginPage fixture
│   ├── utils/
│   │   └── auth.ts               # Shared login-setup helper (used by saucedemo.spec.ts)
│   ├── test-data/
│   │   └── loginData.ts          # Typed reusable login accounts + negative scenario data
│   ├── login.spec.ts             # Login scenarios (positive + data-driven negatives)
│   └── saucedemo.spec.ts         # Cart, checkout, sorting, logout flows
├── .github/
│   └── workflows/
│       └── playwright-tests.yml  # CI pipeline
├── playwright.config.ts          # Config: testIdAttribute, reporters, retries, timeouts
├── package.json                  # Scripts and dependencies
└── README.md
```

> Page objects hold locators, actions, and state (e.g. `isLoginPageDisplayed()`,
> `getLoginErrorMessage()`) and contain **no** `expect()` assertions — tests own all
> verification. This keeps page objects reusable and tests readable.

---

## Technologies Used

| Tool | Purpose |
|---|---|
| [Playwright Test](https://playwright.dev/) (`@playwright/test`) | Test runner, browser automation, assertions |
| [TypeScript](https://www.typescriptlang.org/) | Typed, self-documenting test code |
| [Node.js](https://nodejs.org/) (v20 in CI) | Runtime |
| [GitHub Actions](https://docs.github.com/actions) | Continuous Integration |

---

## How to Run

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers (first time only)

```bash
npx playwright install
```

### 3. Run the tests

```bash
npm test                 # run the full suite (headless)
npm run test:headed      # run in a visible browser
npm run test:report      # open the last HTML report
```

Or run Playwright directly:

```bash
npx playwright test
npx playwright test --headed
npx playwright test tests/saucedemo.spec.ts   # a single spec file
npx playwright test --list                    # list tests without running them
```

---

## Environment Configuration

**Environment selection.** Tests run against a named environment selected via the
`TEST_ENV` variable — `qa` or `staging`, defined in `config/environments.ts`. If unset,
it defaults to `qa`. An unknown value fails immediately with a clear error before any
test runs.

**Required setup.** Copy the example file and adjust values if needed:

```bash
cp .env.example .env
```

`.env` is git-ignored — it is never committed.

**Example commands:**

```bash
npm run test:qa         # run against the qa environment
npm run test:staging    # run against the staging environment
npx playwright test     # TEST_ENV unset — defaults to qa
```

**Secret-handling warning.** `.env.example` contains placeholder values only. Never put
real credentials, tokens, or non-public URLs into any committed file — only `.env`
(git-ignored) or your CI provider's secret store.

---

## Why This Framework Was Built

This project exists to demonstrate **how a professional QA/SDET structures a UI
automation framework**, not just that tests can be made to pass. The goals:

- **Show maintainability, not just coverage.** Anyone can record clicks; the value is
  in code that survives UI refactors and stays readable as the suite grows.
- **Practice real design principles.** Page Object Model, the locator hierarchy, and
  separation of concerns are the same patterns used in enterprise test suites.
- **Learn by iterating deliberately.** Each change is small, explained, and justified,
  building the habits and vocabulary needed for automation interviews and real teams.
- **Serve as a portfolio piece.** It is meant to be read by hiring managers and senior
  engineers as evidence of solid automation fundamentals.

---

## Future Improvements

- **More page objects** — extract `InventoryPage`, `CartPage`, and `CheckoutPage` so
  the remaining raw `page.locator(...)` calls in the specs move behind page objects.
- **Fixtures** — a custom Playwright fixture that provides an already-logged-in `page`
  to remove repeated login setup in tests.
- **Data-driven tests** — parameterize logins and products via test data instead of
  hardcoded values.
- **Cross-browser & mobile** — add Chromium/Firefox/WebKit and mobile viewport projects
  in `playwright.config.ts`.
- **Retries & sharding in CI** — enable retries for resilience and shard the suite for
  faster pipelines as it grows.
- **Accessibility checks** — integrate `@axe-core/playwright` for basic a11y assertions.
- **Reporting** — publish the HTML report to GitHub Pages or integrate an Allure report.
