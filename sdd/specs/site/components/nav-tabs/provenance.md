# Provenance — `sdd/specs/site/components/nav-tabs`

## Dev pass — 2026-05-07T18:47:00Z (Cursor, site chain step 3)

**Role:** dev

### Actions

1. Read `sdd/specs/site/components/nav-tabs/spec.md`.
2. Created `src/templates/components/nav-tabs.ts` and `src/styles/components/nav-tabs.css` per authoritative blocks.
3. Added `@import "./components/nav-tabs.css";` to `src/styles/index.css` after masthead import.

### Files touched

| Path | Change |
|------|--------|
| `src/templates/components/nav-tabs.ts` | New |
| `src/styles/components/nav-tabs.css` | New |
| `src/styles/index.css` | Import nav-tabs stylesheet |

### Deviations

None.

---

## QA pass — 2026-05-07T18:55:00Z

**Role:** qa

| Acceptance (from `spec.md`) | Result |
| ---------------------------- | ------ |
| CSS / TS match authoritative blocks | PASS |
| `base.ts` imports `navTabs` | PASS |
| `home.ts` passes `navTabs` data only | PASS |
| `index.css` imports nav-tabs | PASS |
| DOM order docket → masthead → nav → main | PASS |
| Nav e2e assertions | PASS (`e2e/home.spec.ts`) |
| `pnpm test:e2e` | PASS (**65**) |

### QA-touched paths

`e2e/home.spec.ts`, `e2e/base-page.spec.ts`, `sdd/specs/site/components/nav-tabs/scenarios.md`, `sdd/specs/site/components/nav-tabs/provenance.md` (this section).
