# Provenance — `sdd/specs/site/components/masthead`

## Dev pass — 2026-05-07T12:15:00Z (Cursor, spec chain)

**Role:** dev (manual — `pnpm sdd` not invoked: API keys unset).

### Actions

1. Read `sdd/specs/site/components/masthead/spec.md`.
2. Created `src/templates/components/masthead.ts` and `src/styles/components/masthead.css` per authoritative blocks.
3. Added `@import "./components/masthead.css";` to `src/styles/index.css` after docket-strip.
4. Updated `src/templates/pages/home.ts` to call `masthead(...)` as `beforeMain` per spec.
5. Confirmed `src/templates/pages/base.ts` implements optional `beforeMain` without importing masthead (per `pages/base/spec.md`).

### Files touched

| Path | Change |
|------|--------|
| `src/templates/components/masthead.ts` | New |
| `src/styles/components/masthead.css` | New |
| `src/styles/index.css` | Import masthead stylesheet |
| `src/templates/pages/home.ts` | `beforeMain` + masthead data |
| `src/templates/pages/base.ts` | Slot (if not already applied in same pass) |
| `e2e/home.spec.ts`, `e2e/base-page.spec.ts` | Masthead / DOM order coverage |

### Deviations

None.

---

## QA pass — 2026-05-07T12:20:00Z

**Role:** qa (manual)

| Acceptance (from `spec.md`) | Result |
| ---------------------------- | ------ |
| CSS / TS match authoritative blocks | PASS |
| `base.ts` has no masthead import | PASS |
| `index.css` imports masthead | PASS |
| DOM: `.docket` → `header.masthead` → `main` | PASS |
| `pnpm build` / `pnpm test:e2e` | PASS (67) |

### QA-touched paths

`e2e/home.spec.ts`, `e2e/base-page.spec.ts`, `sdd/specs/site/components/masthead/scenarios.md`, `sdd/specs/site/components/masthead/provenance.md` (this section).
