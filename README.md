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
- **Authentication-state reuse** — a Playwright setup project (`tests/auth.setup.ts`)
  logs in once and saves `storageState`; feature tests that only need to be logged in
  reuse it, while `login.spec.ts` always runs a real, unauthenticated login.
- **Failure-focused diagnostics** — screenshot, video, and trace are all retained only
  on failure (nothing extra for a passing test), reported via `list` + `html` locally and
  an additional GitHub-native `github` reporter in CI. See "Diagnostics & Failure
  Artifacts" below.
- **Continuous Integration** — GitHub Actions runs the suite on every push to `main`,
  on a schedule (every 3 hours), and on demand, and uploads the HTML report as an artifact.
- **Independent API-contract tests** — `tests/api/` exercises the public
  [restful-booker](https://restful-booker.herokuapp.com/) practice API directly via
  Playwright's built-in `request` fixture (no Axios/SuperTest). See "API Testing" below
  for why this is a separate suite rather than a SauceDemo hybrid.

---

## Folder Structure

```
saucedemo-playwright/
├── api/                           # Everything for the independent API-contract suite
│   ├── clients/
│   │   └── restfulBookerClient.ts # Builds requests, returns APIResponse — no assertions
│   ├── types/
│   │   ├── auth.ts                # AuthRequest / AuthSuccessResponse / AuthFailureResponse
│   │   └── booking.ts             # CreateBookingRequest / CreateBookingResponse / Booking
│   └── test-data/
│       └── bookerCredentials.ts   # restful-booker's published demo credentials
├── config/
│   ├── environments.ts            # SauceDemo (UI) baseURL per TEST_ENV
│   └── apiEnvironments.ts         # restful-booker (API) baseURL per TEST_ENV — kept separate
├── pages/                        # Page Objects (locators + actions + state helpers)
│   └── LoginPage.ts
├── tests/                        # Test specs (all assertions live here)
│   ├── fixtures.ts               # Custom test.extend() — provides the loginPage fixture
│   ├── test-data/
│   │   └── loginData.ts          # Typed reusable login accounts + negative scenario data
│   ├── api/
│   │   ├── auth.api.spec.ts      # restful-booker /auth — success + "200 but failed" contract
│   │   └── booking.api.spec.ts   # restful-booker /booking — create + not-found
│   ├── login.spec.ts             # Login scenarios (positive + data-driven negatives)
│   └── saucedemo.spec.ts         # Cart, checkout, sorting, logout flows
├── .github/
│   └── workflows/
│       └── playwright-tests.yml  # CI pipeline
├── playwright.config.ts          # Config: testIdAttribute, reporters, retries, timeouts, projects
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

**API environment.** `config/apiEnvironments.ts` resolves the restful-booker API's
base URL from the same `TEST_ENV` variable, kept as a separate file and type from the
UI's `environments.ts` since the two configs describe unrelated systems (see "API
Testing" below). Override with `QA_API_BASE_URL` / `STAGING_API_BASE_URL`.

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

## Authentication State (storageState)

Feature tests that only need to be logged in (`tests/saucedemo.spec.ts`) reuse a saved
Playwright `storageState` instead of a real UI login before every test. Login itself
(`tests/login.spec.ts`) always runs against a real, logged-out browser — it verifies the
login mechanism, so it must never start pre-authenticated.

**Three Playwright projects** (see `playwright.config.ts`):

| Project | Runs | `storageState` |
|---|---|---|
| `setup` | `tests/auth.setup.ts` — logs in once as `standard_user` | — |
| `unauthenticated` | `tests/login.spec.ts` | none (always logged out) |
| `authenticated` | `tests/saucedemo.spec.ts` | `playwright/.auth/standard-user.json` |

`authenticated` depends on `setup`, so the saved session is regenerated at the start of
every run that needs it — never committed, never reused across runs.

```bash
npx playwright test --project=setup            # (re)generate the saved session only
npx playwright test --project=unauthenticated   # login tests — always a real UI login
npx playwright test --project=authenticated     # feature tests — reuse the saved session
npx playwright test                             # full suite — setup runs automatically
```

**Credentials.** `tests/auth.setup.ts` logs in using `standardUser` from the existing
`tests/test-data/loginData.ts` — no credential is duplicated or hardcoded a second time.

**The `.auth` directory.** `playwright/.auth/` holds the generated storage-state file. It
contains a live session cookie, so it's git-ignored and must never be committed — treat
it like `.env`.

---

## API Testing

`tests/api/` is an **independent API-contract suite** against the public
[restful-booker](https://restful-booker.herokuapp.com/) practice API, using Playwright's
built-in `request` fixture (`APIRequestContext`) — no Axios, no SuperTest.

**Why restful-booker and not SauceDemo.** A direct network audit of SauceDemo (page load,
login, inventory display, add-to-cart) found it makes **zero** first-party API calls:
login sets a cookie entirely in client-side JavaScript, and the cart is a plain
`localStorage` array. The only non-static network traffic observed was a third-party
telemetry SDK (`events.backtrace.io`), unrelated to the app's own behavior. SauceDemo
exposes no first-party API to test, so **this suite does not attempt a hybrid SauceDemo
UI/API workflow** — restful-booker is a separate, unrelated demo application, run here
purely to practice API-contract testing and API authentication as their own skills.

**Structure:**

- `api/clients/restfulBookerClient.ts` — builds requests and returns the raw
  `APIResponse`. It contains no `expect()` calls; specs own every assertion, the same
  separation `LoginPage` keeps from `login.spec.ts`.
- `api/types/` — explicit request/response types (`AuthRequest`,
  `AuthSuccessResponse`/`AuthFailureResponse`, `CreateBookingRequest`/`CreateBookingResponse`).
- `api/test-data/bookerCredentials.ts` — restful-booker's own published demo login
  (`admin` / `password123`), not a secret — the same status as SauceDemo's
  `standard_user` in `loginData.ts`. No generated token is ever written to disk.
- `tests/api/auth.api.spec.ts` and `tests/api/booking.api.spec.ts` — assert status,
  content type, response schema, field types, and (for auth) the error contract, not
  just the HTTP status code.

**Run it:**

```bash
npm run test:api                       # API suite only
npx playwright test --project=api      # equivalent
```

---

## Diagnostics & Failure Artifacts

**Philosophy:** a passing test produces no extra evidence; a failing test produces
everything needed to diagnose it without re-running locally.

| Artifact | Setting | Behavior |
|---|---|---|
| Screenshot | `only-on-failure` | One image at the moment of failure. UI tests only. |
| Video | `retain-on-failure` | Recorded throughout, discarded on pass. UI tests only. |
| Trace | `retain-on-failure` | Full replay (DOM snapshots, network, actions), discarded on pass — captured on the first failure itself, independent of whether a retry happens. |

**Reporters:** `list` (console) and `html` always run; an additional built-in `github`
reporter runs only when `CI` is set (GitHub Actions sets this automatically), annotating
failures directly in the Actions log/PR view — no separate download needed to see what
broke.

**Retries:** `0` locally, `1` in CI (`retries: process.env.CI ? 1 : 0` in
`playwright.config.ts`). Zero locally means every pass while developing is a genuine
first-attempt pass. One retry in CI absorbs a single transient blip (a slow runner, a
network hiccup) — it is a resilience safety net, not a way to make a genuinely flaky test
acceptable; Playwright's reporters track a distinct "flaky" count for any test that only
passes after a retry, and that count is what should get investigated.

**Useful commands:**

```bash
npm test                 # run the suite; screenshot/video/trace saved only for failures
npm run test:report      # open the last HTML report (screenshots/video/trace are embedded in it)
npm run trace:show -- test-results/<test-folder>/trace.zip   # open one trace directly
```

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
- **Data-driven tests** — parameterize logins and products via test data instead of
  hardcoded values.
- **Cross-browser & mobile** — add Chromium/Firefox/WebKit and mobile viewport projects
  in `playwright.config.ts`.
- **Retries & sharding in CI** — enable retries for resilience and shard the suite for
  faster pipelines as it grows.
- **Accessibility checks** — integrate `@axe-core/playwright` for basic a11y assertions.
- **Reporting** — publish the HTML report to GitHub Pages or integrate an Allure report.
