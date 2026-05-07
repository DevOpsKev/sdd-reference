---
title: Home page — test scenarios
spec: sdd/specs/site/pages/home
---

## Automated (Playwright)

**Command:** `pnpm test:e2e` (`webServer`: `BUILD_DATE=2026-05-07T15:00:00.000Z pnpm build && pnpm preview`, port **4173**).

**File:** `e2e/home.spec.ts`

| Id | Intent | Expected |
| -- | ------ | -------- |
| H-01 | Root HTTP | `GET /` returns 200. |
| H-02 | Title | Document title `Vinyl Traffic — Industrial Record Dispatch`. |
| H-03 | Layout | `.docket` first under `.page`; `header.masthead`; `nav.tabs`; empty `main`. |
| H-04 | Nav | One `a.active`; Stockroom / Find Us; `.right-tabs` has Search + Bag (0); masthead before nav. |
| H-05 | Masthead | Wordmark, three stamps, tagline substrings. |
| H-06 | Docket copy | Date / DKT / unit patterns; open/closed vs `.light` for fixed `BUILD_DATE`. |

**Result:** 2026-05-07 — **65** tests passed (`e2e/home.spec.ts`, `e2e/base-page.spec.ts`, `e2e/docket-strip.spec.ts`, plus global/docker/code-quality suites).

## Manual / env

- **`BUILD_DATE`:** optional ISO for `generate-index.ts`; invalid values throw. Playwright pins a constant for reproducible docket strings.

## Out of scope (per `spec.md`)

Other routes, real DKT sequence beyond `001`, i18n.
