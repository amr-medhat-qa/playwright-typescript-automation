# Playwright + TypeScript Test Automation

UI and API test automation framework built with **Playwright** and **TypeScript**, running on GitHub Actions.

| Layer | Application under test | What's covered |
|-------|------------------------|----------------|
| UI (E2E) | [SauceDemo](https://www.saucedemo.com) — demo e-commerce store | Login (positive / negative / data-driven), product sorting, cart, full checkout with price calculation checks, form validation |
| API | [Restful-Booker](https://restful-booker.herokuapp.com/apidoc) — hotel booking REST API | Token auth, full CRUD (POST / GET / PUT / PATCH / DELETE), filtering, authorization (403), not-found (404) |

## Highlights

- **Page Object Model** for UI tests (`src/pages`)
- **Custom fixtures** — page objects and a pre-logged-in session are injected into tests (`src/fixtures/ui.fixtures.ts`)
- **API client layer** wrapping Playwright's `APIRequestContext` (`src/api/BookingClient.ts`)
- **Test data factory** generating unique, randomized payloads (`src/data/bookingFactory.ts`)
- **Data-driven tests** for validation scenarios
- **Cross-browser** — Chromium and Firefox
- **Tags** (`@smoke`) for running a fast subset
- **CI** on every push / PR plus a scheduled daily run, with HTML reports, traces, screenshots and videos on failure
- **Strict TypeScript** with a type-check step in CI

## Project structure

```
├── .github/workflows/playwright.yml   # CI pipeline (matrix: api, ui-chromium, ui-firefox)
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

| Command | Description |
|---------|-------------|
| `npm test` | Run everything |
| `npm run test:api` | API tests only |
| `npm run test:ui` | UI tests (Chromium + Firefox) |
| `npm run test:smoke` | `@smoke` tagged tests only |
| `npm run test:headed` | UI tests in a visible browser |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | TypeScript type check |

### Configuration

All values have working defaults (public demo data). They can be overridden with environment variables:

| Variable | Default |
|----------|---------|
| `UI_BASE_URL` | `https://www.saucedemo.com` |
| `API_BASE_URL` | `https://restful-booker.herokuapp.com` |
| `SAUCE_PASSWORD` | `secret_sauce` |
| `BOOKER_USERNAME` / `BOOKER_PASSWORD` | `admin` / `password123` |

## Notes on the APIs under test

Restful-Booker deliberately contains quirks; tests assert the **actual documented behavior** and call it out in comments:
- invalid credentials on `/auth` return `200` with `{ "reason": "Bad credentials" }` instead of `401`
- `DELETE /booking/:id` returns `201`

## Author

**Amr Medhat** — Senior QA Engineer
