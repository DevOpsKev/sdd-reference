---
title: Home page — test scenarios
spec: sdd/specs/site/pages/home
---

## Automated (Playwright)

**Command:** `pnpm test:e2e` (uses `playwright.config.ts` `webServer`: `BUILD_DATE=2026-05-07T15:00:00.000Z pnpm build && pnpm preview` on port **4173**).

**File:** `e2e/home.spec.ts`

| Id | Intent | Expected |
| -- | ------ | -------- |
| H-01 | Root HTTP | `GET /` returns 200. |
| H-02 | Title | Document title is `Vinyl Traffic — Industrial Record Dispatch`. |
| H-03 | Layout | `.docket` visible; first direct child of `.page` has class `docket`; `header.masthead` visible; `.page > main` exists once and is empty. |
| H-04 | Docket copy | Date line matches `^[A-Z]{3} \d{2}\.\d{2}\.\d{4} \/ \d{2}:\d{2}$`; DKT line matches `^DKT-\d{4}-W\d{2}-001$`; unit line is exactly `UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX`. |
| H-05 | Open/closed | For the fixed `BUILD_DATE`, `isUnitOpen` from `build/lib/unit-open.ts` matches presence of `.docket .light` and `UNIT CLOSED` when closed. |
| H-06 | Masthead | `.wordmark-stamp` contains VINYL and TRAFFIC; default / `.ink` / `.red` stamps; tagline contains `Soroksári út` and `don't have a shop`. |

**Result (2026-05-07):** All six scenarios passed. Full suite **67** tests passed. `pnpm build` succeeded (`prebuild` runs `tsx build/generate-index.ts`).

## Manual / env

- **BUILD_DATE:** Optional ISO string; `build/generate-index.ts` throws on invalid. E2E pins a constant via `playwright.config.ts` for reproducible docket output.

## Out of scope (per spec)

Other routes, real DKT sequence, i18n — not covered here. Masthead CSS/HTML details: `sdd/specs/site/components/masthead/spec.md`.
