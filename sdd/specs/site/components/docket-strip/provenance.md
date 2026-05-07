# Provenance — `sdd/specs/site/components/docket-strip`

## Dev pass — 2026-05-07T18:45:00Z (Cursor, site chain step 1)

**Role:** dev

### Actions

1. Read `sdd/specs/site/components/docket-strip/spec.md`.
2. Created `src/templates/components/docket-strip.ts` and `src/styles/components/docket-strip.css` per authoritative blocks.
3. Added `@import "./components/docket-strip.css";` to `src/styles/index.css` after `base.css`.

### Files touched

| Path | Change |
|------|--------|
| `src/templates/components/docket-strip.ts` | New |
| `src/styles/components/docket-strip.css` | New |
| `src/styles/index.css` | Import docket-strip stylesheet |

### Deviations

None.

---

## QA pass — 2026-05-07T18:55:00Z

**Role:** qa

| Acceptance (from `spec.md`) | Result |
| ---------------------------- | ------ |
| CSS / TS match authoritative blocks | PASS |
| `index.css` imports docket-strip | PASS |
| `pnpm build` after full chain | PASS |
| `pnpm test:e2e` | PASS (**65**) |

### QA-touched paths

`e2e/docket-strip.spec.ts`, `e2e/home.spec.ts`, `e2e/base-page.spec.ts`, `sdd/specs/site/components/docket-strip/scenarios.md`, `sdd/specs/site/components/docket-strip/provenance.md` (this section).
