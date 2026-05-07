# Provenance — `sdd/specs/site/pages/base`

## Dev pass — 2026-05-07T18:48:00Z (Cursor, site chain step 4)

**Role:** dev

### Actions

1. Read `sdd/specs/site/pages/base/spec.md`.
2. Created `src/templates/pages/base.ts` per authoritative block: imports `docketStrip`, `masthead`, `navTabs`; composes `.page` with docket → masthead → nav → `<main>`.
3. Confirmed `src/styles/base.css` already contains the `.page` and `main` layout rules before `prefers-reduced-motion` (global-css baseline).

### Files touched

| Path | Change |
|------|--------|
| `src/templates/pages/base.ts` | New |

### Deviations

None.

---

## QA pass — 2026-05-07T18:55:00Z

**Role:** qa

| Acceptance (from `spec.md`) | Result |
| ---------------------------- | ------ |
| `base.ts` matches authoritative block | PASS |
| `base.css` includes `.page` / `main` rules | PASS (pre-existing global-css layout) |
| Four direct children under `.page` on `/` | PASS (`e2e/base-page.spec.ts`, `e2e/home.spec.ts`) |
| `pnpm build` + `pnpm test:e2e` | PASS (**65**) |

### QA-touched paths

`e2e/base-page.spec.ts`, `e2e/home.spec.ts`, `sdd/specs/site/pages/base/scenarios.md`, `sdd/specs/site/pages/base/provenance.md` (this section).
