# Provenance — `sdd/specs/site/pages/base`

## Dev pass — 2026-05-07T12:15:00Z (Cursor, spec chain)

**Role:** dev (manual — `pnpm sdd` agents skipped: API keys unset locally).

### Actions

- Updated `src/templates/pages/base.ts` to match `spec.md`: optional `beforeMain?: string` on `BasePageData`; `${beforeMainHtml}` interpolated between docket and `<main>`; **no** `masthead` import.

### Files touched

| Path | Change |
|------|--------|
| `src/templates/pages/base.ts` | `beforeMain` slot |

### Notes

- Layout CSS unchanged; already matched `spec.md` before this pass.

---

## QA pass — 2026-05-07T12:20:00Z

**Role:** qa (manual verification)

| Check | Result |
|-------|--------|
| `base.ts` matches authoritative block in `spec.md` (incl. `beforeMain`) | PASS |
| `src/styles/base.css` layout rules before `prefers-reduced-motion` | PASS |
| Preview: `.page` first child `.docket`; order docket → `header.masthead` → `main` on `/` | PASS (`e2e/base-page.spec.ts`) |
| `pnpm build` | PASS |
| `pnpm test:e2e` | PASS (67 tests) |

### QA-touched paths

`e2e/base-page.spec.ts`, `sdd/specs/site/pages/base/scenarios.md`, `sdd/specs/site/pages/base/provenance.md` (this section).
