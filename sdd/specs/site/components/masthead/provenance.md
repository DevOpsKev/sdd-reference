# Provenance — `sdd/specs/site/components/masthead`

## Dev pass — 2026-05-07T18:46:00Z (Cursor, site chain step 2)

**Role:** dev

### Actions

1. Read `sdd/specs/site/components/masthead/spec.md`.
2. Created `src/templates/components/masthead.ts` and `src/styles/components/masthead.css` per authoritative blocks.
3. Added `@import "./components/masthead.css";` to `src/styles/index.css` after docket-strip import.

### Files touched

| Path | Change |
|------|--------|
| `src/templates/components/masthead.ts` | New |
| `src/styles/components/masthead.css` | New |
| `src/styles/index.css` | Import masthead stylesheet |

### Deviations

None.

---

## QA pass — 2026-05-07T18:55:00Z

**Role:** qa

| Acceptance (from `spec.md`) | Result |
| ---------------------------- | ------ |
| CSS / TS match authoritative blocks | PASS |
| `base.ts` imports `masthead` | PASS |
| `home.ts` passes `masthead` data (no `masthead()` import) | PASS |
| `index.css` imports masthead | PASS |
| DOM: masthead second under `.page` | PASS (`e2e/home.spec.ts`, `e2e/base-page.spec.ts`) |
| `pnpm test:e2e` | PASS (**65**) |

### QA-touched paths

`e2e/home.spec.ts`, `e2e/base-page.spec.ts`, `sdd/specs/site/components/masthead/scenarios.md`, `sdd/specs/site/components/masthead/provenance.md` (this section).
