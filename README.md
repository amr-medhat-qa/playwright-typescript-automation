# Playwright + TypeScript Test Automation

[![Playwright Tests](https://github.com/amr-medhat-qa/playwright-typescript-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/amr-medhat-qa/playwright-typescript-automation/actions/workflows/playwright.yml)
[![Test Report](https://img.shields.io/badge/report-live-2ea44f?logo=playwright)](https://amr-medhat-qa.github.io/playwright-typescript-automation/)
[![Allure Report](https://img.shields.io/badge/Allure-report-ff6a00)](https://amr-medhat-qa.github.io/playwright-typescript-automation/allure/)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![ESLint](https://img.shields.io/badge/lint-ESLint-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/code_style-Prettier-F7B93E?logo=prettier&logoColor=black)

📊 **Live reports** (published automatically after every run on `main`):
**[Playwright HTML report →](https://amr-medhat-qa.github.io/playwright-typescript-automation/)** · **[Allure report →](https://amr-medhat-qa.github.io/playwright-typescript-automation/allure/)**

UI and API test automation framework built with **Playwright** and **TypeScript**, running on GitHub Actions.

| Layer         | Application under test                                                                 | What's covered                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| UI (E2E)      | [SauceDemo](https://www.saucedemo.com) — demo e-commerce store                         | Login (positive / negative / data-driven), product sorting, cart, full checkout with price calculation checks, form validation |
| API           | [Restful-Booker](https://restful-booker.herokuapp.com/apidoc) — hotel booking REST API | Token auth, full CRUD (POST / GET / PUT / PATCH / DELETE), filtering, authorization (403), not-found (404)                     |
| Accessibility | SauceDemo                                                                              | axe-core scans for **WCAG 2.1 AA** on every key page, tracked best-practice issues, keyboard-only login, accessible names      |
| Visual        | SauceDemo                                                                              | Screenshot comparison of pages & components against Linux baselines, plus **detection of a real visual bug**                   |

## Accessibility testing ♿

Every key page (login, login error, inventory, cart, checkout) is scanned with **[axe-core](https://github.com/dequelabs/axe-core)**:

- **WCAG 2.1 A/AA** — must have **zero** violations; any new one fails the build.
- **Best practices** — current findings are tracked as a known list (`page-has-heading-one`, `region`): a _new_ issue fails, a _fixed_ one shows up as a diff.
- The full axe result is attached to every test in the report.
- Plus keyboard-only navigation and accessible-name checks.

## Visual regression testing 📸

`toHaveScreenshot()` compares pages and components with stored baselines (tolerance: 50 px, animations disabled).

- **Why baselines are generated in CI:** rendering differs between Windows, macOS and Linux (fonts, anti-aliasing). Baselines are created on the same Linux runner that compares them — missing ones are generated and committed back to the branch automatically; all can be regenerated via **Run workflow → update visual baselines** after an intended UI change.
- **Proof it works:** SauceDemo's `visual_user` is _functionally_ identical to a normal user — every functional test passes — but renders wrong images, prices, icon positions and alignment. The visual suite catches it (marked `@known-visual-bug` with `test.fail()`, diff image attached to the report):

  > Functional tests answer _"does it work?"_ — visual tests answer _"does it look right?"_

## Highlights

- **Page Object Model** for UI tests (`src/pages`)
- **Custom fixtures** — page objects and a pre-logged-in session are injected into tests (`src/fixtures/ui.fixtures.ts`)
- **API client layer** wrapping Playwright's `APIRequestContext` (`src/api/BookingClient.ts`)
- **Test data factory** generating unique, randomized payloads (`src/data/bookingFactory.ts`)
- **Data-driven tests** for validation scenarios
- **Cross-browser** — Chromium and Firefox
- **Tags** (`@smoke`) for running a fast subset
- **CI** on every push / PR plus a scheduled daily run — reports from all jobs are merged into one HTML report (traces, screenshots, videos on failure) and **published to GitHub Pages**
- **Allure reporting** — test history, categories and environment info, published next to the Playwright report
- **Quality gate** — strict TypeScript, ESLint (incl. `eslint-plugin-playwright`: no `test.only`, no hard waits) and Prettier run before any test job

## Project structure

```
├── .github/workflows/playwright.yml   # CI pipeline (matrix: api, ui-chromium, ui-firefox, a11y, visual)
├── src/
│   ├── api/BookingClient.ts           # API client
│   ├── data/                          # test data & factories
│   ├── fixtures/                      # custom Playwright fixtures
│   └── pages/                         # Page Objects
├── tests/
│   ├── api/                           # API specs
│   └── ui/                            # UI specs
└── playwright.config.ts
```

## Getting started

```bash
npm ci
npx playwright install chromium firefox
```

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm test`             | Run everything                                |
| `npm run test:api`     | API tests only                                |
| `npm run test:ui`      | UI tests (Chromium + Firefox)                 |
| `npm run test:smoke`   | `@smoke` tagged tests only                    |
| `npm run test:headed`  | UI tests in a visible browser                 |
| `npm run report`       | Open the last HTML report                     |
| `npm run allure:serve` | Build and open the Allure report (needs Java) |
| `npm run check`        | Type check + lint + format check              |
| `npm run lint:fix`     | Auto-fix lint issues                          |
| `npm run format`       | Format all files with Prettier                |

### Configuration

All values have working defaults (public demo data). They can be overridden with environment variables:

| Variable                              | Default                                |
| ------------------------------------- | -------------------------------------- |
| `UI_BASE_URL`                         | `https://www.saucedemo.com`            |
| `API_BASE_URL`                        | `https://restful-booker.herokuapp.com` |
| `SAUCE_PASSWORD`                      | `secret_sauce`                         |
| `BOOKER_USERNAME` / `BOOKER_PASSWORD` | `admin` / `password123`                |

## Notes on the APIs under test

Restful-Booker deliberately contains quirks; tests assert the **actual documented behavior** and call it out in comments:

- invalid credentials on `/auth` return `200` with `{ "reason": "Bad credentials" }` instead of `401`
- `DELETE /booking/:id` returns `201`

## Author

**Amr Medhat** — Senior QA Engineer
