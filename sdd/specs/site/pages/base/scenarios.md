# Test scenarios — `sdd/specs/site/pages/base`

Automated coverage: **`e2e/base-page.spec.ts`** (template + preview), **`e2e/home.spec.ts`** (DOM on `/`). Preview uses **`BUILD_DATE=2026-05-07T15:00:00.000Z`** in `playwright.config.ts`.

## Template (`basePage`)

| ID | Scenario | Expectation |
| -- | -------- | ----------- |
| B-T01 | Title escaping | `<title>` escapes `&`, `<`, etc. |
| B-T02 | `.page` composition | Docket HTML before `header.masthead` before `nav.tabs` before `<main>` |
| B-T03 | Theme colour | `<meta name="theme-color" content="#ece6d4">` |

## Preview (`pnpm preview` on 4173)

| ID | Scenario | Expectation |
| -- | -------- | ----------- |
| B-H01 | First child of `.page` | `div.docket` |
| B-H02 | Child count / order | Four children: docket, `header.masthead`, `nav.tabs`, `main`; `main` empty on home |
| B-H03 | Fixed-clock docket | With pinned `BUILD_DATE`, docket shows `DKT-2026-W19-001`, `THU 07.05.2026 / 17:00`, unit label |

## Commands

- `pnpm build` — `prebuild` runs `tsx build/generate-index.ts`, then Vite.
- `pnpm test:e2e` — Playwright on port **4173**.

**Last run:** 2026-05-07 — **65** tests passed.
