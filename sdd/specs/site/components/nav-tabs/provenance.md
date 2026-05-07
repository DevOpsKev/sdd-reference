# Provenance — `sdd/specs/site/components/nav-tabs`

## Dev pass — 2026-05-07T16:00:00Z (Cursor, combined dev+qa)

**Role:** dev (manual implementation against `spec.md`).

### Actions

1. Read `sdd/specs/site/components/nav-tabs/spec.md`.
2. Created `src/styles/components/nav-tabs.css` and `src/templates/components/nav-tabs.ts` per authoritative blocks.
3. Appended `@import "./components/nav-tabs.css";` to `src/styles/index.css` after masthead.
4. Replaced `src/templates/pages/home.ts` with spec block: `beforeMain = masthead(...) + navTabs(...)`.
5. Confirmed `src/templates/pages/base.ts` does not import `navTabs`.

### Files touched

| Path | Change |
|------|--------|
| `src/styles/components/nav-tabs.css` | New |
| `src/templates/components/nav-tabs.ts` | New |
| `src/styles/index.css` | Import nav-tabs stylesheet |
| `src/templates/pages/home.ts` | Compose nav after masthead in `beforeMain` |

### Deviations

None.

---

## QA pass — 2026-05-07T16:05:00Z

**Role:** qa (manual, same session)

| Acceptance (from `spec.md`) | Result |
| ---------------------------- | ------ |
| CSS / TS match authoritative blocks | PASS |
| `base.ts` has no `navTabs` import | PASS |
| `home.ts` matches spec block | PASS |
| `index.css` imports nav-tabs | PASS |
| DOM: `.docket` → `header.masthead` → `nav.tabs` → `main` | PASS |
| `e2e/home.spec.ts` + `e2e/base-page.spec.ts` nav / child count | PASS (`pnpm test:e2e`, 68) |

### QA-touched paths

`e2e/home.spec.ts`, `e2e/base-page.spec.ts`, `sdd/specs/site/components/nav-tabs/scenarios.md`, `sdd/specs/site/components/nav-tabs/provenance.md` (this section).
