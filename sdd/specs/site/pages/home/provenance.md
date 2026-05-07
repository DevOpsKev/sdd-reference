# Provenance — `sdd/specs/site/pages/home`

## Dev pass — 2026-05-07T12:15:00Z (Cursor, spec chain)

**Role:** dev (manual — workflow agents not run: API keys unset).

### Actions

- Updated `src/templates/pages/home.ts` per `sdd/specs/site/components/masthead/spec.md`: import `masthead`, pass `beforeMain: masthead({ … })` with vision-default copy; `children: ''` unchanged.

### Files touched

| Path | Change |
|------|--------|
| `src/templates/pages/home.ts` | Masthead wiring for `/` only |

### Notes

- `build/generate-index.ts`, `build/lib/*`, `package.json` `prebuild` unchanged from prior home spec implementation.

---

## QA pass — 2026-05-07T12:20:00Z

**Role:** qa (manual)

| Check | Result |
|-------|--------|
| `pnpm build` (`prebuild` → `generate-index.ts`, then Vite) | PASS |
| `pnpm test:e2e` | PASS (67 tests; `e2e/home.spec.ts` includes masthead assertions) |
| `/` shows docket + masthead + empty `<main>` | PASS |

### QA-touched paths

`e2e/home.spec.ts`, `sdd/specs/site/pages/home/scenarios.md`, `sdd/specs/site/pages/home/provenance.md` (this section).
