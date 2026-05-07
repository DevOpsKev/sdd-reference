# Test scenarios — `sdd/specs/site/pages/base`

Automated coverage lives under `e2e/` (`base-page.spec.ts`, `vite-baseline.spec.ts`, `docket-strip.spec.ts`). Preview runs after **`BUILD_DATE=2026-05-07T15:00:00.000Z pnpm build`** (see `playwright.config.ts`) so Budapest-local docket strings stay deterministic.

## Template (`basePage`)

| ID | Scenario | Expectation |
| -- | -------- | ----------- |
| B-T01 | Call `basePage` with representative title needing escaping | `<title>` contains escaped `&`, `<`, etc.; no raw injection |
| B-T02 | Inspect HTML structure around `.page` | First markup inside `.page` is the `.docket` root; optional `beforeMain` (opaque string) may appear next; `<main>` follows with interpolated `children` |
| B-T03 | Theme colour | `<meta name="theme-color" content="#ece6d4">` present |

## Layout CSS (`src/styles/base.css`)

| ID | Scenario | Expectation |
| -- | -------- | ----------- |
| B-C01 | Locate layout rules vs motion query | `.page` centring/max-width/gutter rules and `main { padding-top: 1.5rem; }` appear **above** `@media (prefers-reduced-motion: reduce)` |

## Emitted HTML (preview / `pnpm build`)

| ID | Scenario | Expectation |
| -- | -------- | ----------- |
| B-H01 | DOM order under `.page` on `/` | Direct children: `div.docket`, `header.masthead`, `main` (masthead from home `beforeMain` only) |
| B-H02 | Main slot | `<main>` is present, empty on the wired home page |
| B-H03 | Fixed-clock docket | With pinned `BUILD_DATE`, date text matches the home-spec pattern (weekday + `DD.MM.YYYY / HH:MM`); DKT ref matches `DKT-YYYY-Www-001`; unit label matches home copy |
| B-H04 | Closed-hours styling | For `2026-05-07T15:00:00.000Z`, strip shows **UNIT CLOSED** and no `.light` span |

## Negative / out of scope (documentary)

| ID | Scenario | Expectation |
| -- | -------- | ----------- |
| B-N01 | Nav / footer | Not asserted — out of scope in `spec.md` |

## Commands

- `pnpm build` — regenerates root `index.html` via `prebuild` (`tsx build/generate-index.ts`) then Vite production build.
- `pnpm test:e2e` — Playwright against `vite preview` on port **4173** (starts via config).
