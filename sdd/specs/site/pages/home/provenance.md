# Provenance — `sdd/specs/site/pages/home`

## Dev pass — 2026-05-07T18:49:00Z (Cursor, site chain step 5)

**Role:** dev

### Actions

1. Read `sdd/specs/site/pages/home/spec.md`.
2. Created `build/lib/date-format.ts`, `build/lib/unit-open.ts`, `build/lib/dkt-ref.ts` per requirements.
3. Created `src/templates/pages/home.ts` per authoritative block (data-only `masthead` / `navTabs` objects on `basePage`).
4. Created `build/generate-index.ts`; added `"prebuild": "tsx build/generate-index.ts"` to `package.json` (before `vite build` via pnpm lifecycle).
5. Restored `playwright.config.ts` `webServer` to use `BUILD_DATE=2026-05-07T15:00:00.000Z pnpm build && pnpm preview` for reproducible docket output.
6. Updated `e2e/vite-baseline.spec.ts` titles to match shipped home shell (product title, not literal `Vite baseline` string).

### Files touched

| Path | Change |
|------|--------|
| `build/lib/date-format.ts` | New |
| `build/lib/unit-open.ts` | New |
| `build/lib/dkt-ref.ts` | New |
| `build/generate-index.ts` | New |
| `src/templates/pages/home.ts` | New |
| `package.json` | `prebuild` script |
| `playwright.config.ts` | `webServer` command |
| `e2e/vite-baseline.spec.ts` | Title / smoke strings for integrated `/` |
| `index.html` | Regenerated on each `pnpm build` via `prebuild` |

### Deviations

None.

---

## QA pass — 2026-05-07T18:55:00Z

**Role:** qa

| Acceptance (from `spec.md`) | Result |
| ---------------------------- | ------ |
| Helpers + `home.ts` + `generate-index.ts` + `prebuild` | PASS |
| `home.ts` matches authoritative block | PASS |
| `pnpm build` / `pnpm preview` docket + masthead + nav + empty `main` | PASS |
| `BUILD_DATE` honoured in Playwright `webServer` | PASS |
| `e2e/home.spec.ts` covers Playwright section | PASS |
| `pnpm test:e2e` | PASS (**65**) |

### QA-touched paths

`e2e/home.spec.ts`, `e2e/base-page.spec.ts`, `e2e/docket-strip.spec.ts`, `e2e/vite-baseline.spec.ts`, `sdd/specs/site/pages/home/scenarios.md`, `sdd/specs/site/pages/home/provenance.md` (this section).
