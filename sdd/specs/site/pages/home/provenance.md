---
title: Home page — provenance
---

# Provenance: Home page — first composition

**Spec:** `sdd/specs/site/pages/home/spec.md`
**Executed:** 2026-05-06T14:45:00Z
**Agent:** claude (dev role, model: claude-sonnet-4-5)
**Branch:** spec/basepage

## Actions taken

1. **Created** `build/lib/date-format.ts` — Canonical date formatter implementing the `DDD DD.MM.YYYY / HH:MM` format using `Intl.DateTimeFormat` with explicit options. Defaults to Europe/Budapest timezone.

2. **Created** `build/lib/unit-open.ts` — Unit open/closed computation returning `true` when local hour is >= 22 or < 5. Uses `Intl.DateTimeFormat` to extract the hour in the target timezone. No external dependencies.

3. **Created** `build/lib/dkt-ref.ts` — DKT reference generator producing `DKT-YYYY-Www-001` format codes using ISO 8601 week date algorithm. Computes ISO week and year-of-week with date arithmetic. Fixed `-001` suffix as specified.

4. **Created** `src/templates/pages/home.ts` — Homepage template implementing the interface defined in the spec. Imports `basePage` from `./base` and the three helpers from `build/lib/`. Computes docket data from build date, hard-codes unit label, passes empty `children` string to `basePage()`.

5. **Created** `build/generate-index.ts` — Pre-build script that generates `index.html` from the homepage template. Supports `BUILD_DATE` environment variable for reproducibility. Injects a script tag referencing `/src/main.ts` so Vite processes the HTML and bundles CSS.

6. **Updated** `src/main.ts` — Removed client-side rendering logic. Now only imports `./styles/index.css` so Vite knows to bundle it. The homepage is fully static; no client-side JavaScript runs.

7. **Updated** `package.json` — Added `prebuild` script to run `tsx build/generate-index.ts`, added `test:unit` script to run Node's built-in test runner with `tsx` against `build/lib/*.test.ts`, updated `check` script to include unit tests, updated `test` script to run both unit and e2e tests.

8. **Created** `build/lib/date-format.test.ts` — Unit tests for `formatDocketDate` covering midnight, noon, end-of-day, early morning, UTC vs Budapest timezone difference, day name correctness (all seven days), and default timezone parameter.

9. **Created** `build/lib/unit-open.test.ts` — Unit tests for `isUnitOpen` covering 23:00 (open), 22:00 (boundary, open), 04:30 (open), 12:00 (closed), 09:00 (closed), 05:00 (boundary, closed), 04:59:59 (open), 21:59:59 (closed), default timezone, and Sunday treatment (same as other days).

10. **Created** `build/lib/dkt-ref.test.ts` — Unit tests for `generateDktRef` covering Wednesday 6 May 2026 (W19), format pattern validation, 1 January 2027 (W53 of 2026), 29 December 2025 (W01 of 2026), year boundary edge cases, mid-year week number progression, fixed `-001` suffix, default timezone, and same-date-different-timezone behavior.

11. **Created** `e2e/home.spec.ts` — Playwright e2e tests covering all acceptance criteria: `/` returns 200, correct title, docket strip rendered as first body block, date label matches canonical format, DKT ref matches pattern, unit label exact match, open/closed state consistency with `__pulse` element, empty `<main>`, bundled stylesheet linked, font preloads present, page wrapper structure.

## Decisions made

### Build wiring approach (pre-build script)

Chose **approach 2** from the spec: a small TypeScript script invoked before `vite build`. The script (`build/generate-index.ts`) generates `index.html` at the repository root by calling `homePage({ buildDate })`, then Vite processes the file during build (injecting stylesheet link, copying fonts).

**Rationale:**

- Clean separation: homepage template produces HTML; Vite handles bundling and asset management
- Transparent: the generated `index.html` is readable before Vite processes it
- Reproducible: `BUILD_DATE` env var fixes the build moment for deterministic output
- Simple: no Vite plugin complexity, no deep Vite API knowledge required

**Trade-off:** The generated `index.html` includes a `<script type="module" src="/src/main.ts"></script>` tag so Vite knows to bundle and inject the stylesheet. This script only imports CSS; no JavaScript executes on the homepage. The alternative (Vite plugin) would avoid the minimal JS bundle (0.71 kB gzipped) but adds implementation complexity. The spec allows the agent to choose; this trade-off favors simplicity.

### Unit test framework (Node's built-in test runner)

Used **Node's built-in `node:test`** module with **`tsx`** (already in `devDependencies`) to run TypeScript tests directly. No additional test framework dependencies added.

**Rationale:**

- Spec explicitly requires: "Use Node's built-in test runner (`node:test`) and the repo's existing `tsx` runner — no new test framework dependencies unless unavoidable."
- `tsx` was already available for other build scripts (`build/validate-tokens.ts`, etc.)
- Node's `node:test` provides `test()`, `assert`, and TAP output out of the box (Node 20+)

All 26 unit tests pass. No additional dependencies needed.

### Helper implementations

All three helpers use `Intl.DateTimeFormat` for timezone-aware date operations. No external dependencies (no `date-fns`, `moment`, `luxon`). This aligns with the spec requirement: "No external dependencies."

- **`formatDocketDate`**: Uses `Intl.DateTimeFormat` twice (once for day name, once for date/time parts) and assembles the string manually. Simple and predictable.
- **`isUnitOpen`**: Extracts the hour from `formatToParts`, compares `>= 22 || < 5`. Correct across DST boundaries because `Intl` handles timezone rules.
- **`generateDktRef`**: Implements ISO 8601 week date algorithm with explicit date arithmetic. Computes Thursday of the current week, finds ISO year, calculates week number from Jan 4 of that year. Handles year-boundary edge cases correctly (verified by unit tests).

## Deviations from spec

**None.** All requirements in the spec were implemented exactly as written:

- Homepage template interface matches the spec signature
- Date format is `DDD DD.MM.YYYY / HH:MM` as specified
- Unit open hours are 22:00–04:59:59 as specified
- DKT ref format is `DKT-YYYY-Www-001` with fixed `-001` suffix as specified
- `children` slot is empty as specified
- Unit label is hard-coded to `UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX` as specified
- Title is `Vinyl Traffic — Industrial Record Dispatch` as specified

## Validation results

### Unit tests (`pnpm test:unit`)

**Status:** ✅ **PASS**
**Result:** 26/26 tests passed

- `date-format.test.ts`: 7 tests passed (midnight, noon, end-of-day, early morning, UTC vs Budapest, day name correctness, defaults)
- `unit-open.test.ts`: 9 tests passed (open/closed boundaries, default timezone, Sunday treatment)
- `dkt-ref.test.ts`: 10 tests passed (ISO week 19, format pattern, year boundaries, week number progression, fixed suffix, timezone handling)

### E2E tests (`pnpm test:e2e e2e/home.spec.ts`)

**Status:** ✅ **PASS**
**Result:** 11/11 tests passed

Coverage:

- ✅ `/` returns 200
- ✅ Correct title
- ✅ Docket strip rendered as first body block
- ✅ Date label matches canonical format pattern `DDD DD.MM.YYYY / HH:MM`
- ✅ DKT ref matches pattern `DKT-YYYY-Www-001`
- ✅ Unit label exactly `UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX`
- ✅ Open/closed state consistent with `__pulse` element presence/absence
- ✅ `<main>` element exists and is empty
- ✅ Bundled stylesheet linked with content-hashed filename (`/assets/index-[hash].css`)
- ✅ Font preloads present (Special Elite, JetBrains Mono)
- ✅ Page wrapper structure correct (`.page` > `.docket-strip` + `<main>`)

### Build (`pnpm build`)

**Status:** ✅ **SUCCESS**
**Output:**

```
dist/index.html                 1.36 kB │ gzip: 0.59 kB
dist/assets/index-CquX1fMU.css  5.27 kB │ gzip: 1.98 kB
dist/assets/index-COAHC_o2.js   0.71 kB │ gzip: 0.40 kB
```

The built `dist/index.html`:

- Contains docket strip with current build-time date, current week's DKT ref, and correct open/closed state for the build's wall-clock moment
- Contains empty `<main>` element
- Links bundled stylesheet (injected by Vite)
- Includes two font preload links from `pages/base/`
- Has correct `<title>`, meta tags, and `lang="en"` from `basePage()`

### Preview (`pnpm preview`)

**Status:** ✅ **SUCCESS**
Server starts on `:4173`, visiting `/` returns the built homepage with visible docket strip and empty main content.

### Reproducibility

**Status:** ✅ **VERIFIED**

```bash
BUILD_DATE="2026-05-06T12:00:00Z" pnpm build
```

Builds with fixed date produce identical `index.html` given the same `BUILD_DATE` value. The build date is captured in the docket strip's date label and DKT ref. Verified by generating twice with the same `BUILD_DATE` and comparing outputs.

## Artifacts produced

### Created files

| Path | Status | Purpose |
| ---- | ------ | ------- |
| `build/lib/date-format.ts` | Created | Date formatter helper |
| `build/lib/unit-open.ts` | Created | Unit open/closed computation |
| `build/lib/dkt-ref.ts` | Created | DKT reference generator |
| `build/lib/date-format.test.ts` | Created | Unit tests for date formatter |
| `build/lib/unit-open.test.ts` | Created | Unit tests for unit-open helper |
| `build/lib/dkt-ref.test.ts` | Created | Unit tests for DKT generator |
| `src/templates/pages/home.ts` | Created | Homepage template |
| `build/generate-index.ts` | Created | Pre-build script to generate index.html |
| `e2e/home.spec.ts` | Created | E2E tests for homepage |
| `sdd/specs/site/pages/home/provenance.md` | Created | This file |

### Modified files

| Path | Change | Reason |
| ---- | ------ | ------ |
| `package.json` | Added `prebuild`, `test:unit` scripts; updated `check` and `test` scripts | Wire build generation and unit tests into npm scripts |
| `src/main.ts` | Removed client-side rendering, kept only CSS import | Homepage is now static; main.ts only bundles CSS |

### Build outputs

| Path | Size (gzipped) | Description |
| ---- | -------------- | ----------- |
| `dist/index.html` | 1.36 kB (0.59 kB) | Static homepage with build-time docket data |
| `dist/assets/index-*.css` | 5.27 kB (1.98 kB) | Bundled stylesheet (tokens, reset, base, components) |
| `dist/assets/index-*.js` | 0.71 kB (0.40 kB) | Minimal bundle that imports CSS (no runtime execution) |
| `dist/fonts/*` | (various) | Self-hosted fonts copied from `src/public/fonts/` |

## Notes

### Build date reproducibility

The `BUILD_DATE` environment variable is documented in this provenance and in the source comment at the top of `build/generate-index.ts`. Example:

```bash
BUILD_DATE="2026-05-06T14:30:00Z" pnpm build
```

This is useful for CI reproducibility and for testing that the helpers behave correctly at specific moments (e.g., testing open/closed state at 23:00 vs 12:00).

### ISO week date edge cases

The `generateDktRef` implementation handles year-boundary edge cases correctly:

- 1 January 2027 (Friday) → week 53 of 2026 (Thursday is Dec 31, 2026)
- 29 December 2025 (Monday) → week 1 of 2026 (Jan 4, 2026 is Sunday, so week 1 starts Dec 29)

These are verified by unit tests in `dkt-ref.test.ts`.

### Empty content slot

The homepage's `children` slot is deliberately empty. Per the spec:

> The homepage's `children` slot is **empty** in this version of the spec. `basePage()` renders the docket strip and an empty `<main>`. This is deliberate.

Future specs will amend the homepage to include content blocks (dispatch sheet, stockroom grid, etc.) in a known order. This spec proves the composition works; content comes later.

### Helper reusability

The three helpers in `build/lib/` are scoped to this spec but are reusable project utilities. Future specs (`pages/about/`, `pages/find-us/`, etc.) will likely use `formatDocketDate` and `isUnitOpen` for their own docket strips. The helpers are tested independently and do not depend on the homepage template.

### Fixed `-001` DKT suffix

Per the spec:

> The fixed `-001` suffix is a deliberate piece of dishonesty — the code *looks* unique but isn't. It's documented as such in this spec and in the helper's source comments. When a future spec adds real uniqueness, the change is contained: helper signature unchanged, suffix replaced with a counter.

The implementation faithfully reflects this: `generateDktRef` always returns a code ending in `-001`. The spec explicitly calls this out as intentional, and a future spec will replace the suffix with a real build counter.

### Minimal JS bundle

The built site includes a 0.71 kB (gzipped 0.40 kB) JavaScript bundle that only imports CSS. This is a side effect of the chosen build wiring approach (pre-build script + Vite stylesheet injection). The bundle does not execute any code on the homepage. The alternative (Vite plugin or custom HTML transform) would eliminate the JS bundle but adds implementation complexity. The spec allows the agent to choose the build wiring approach; this trade-off favors simplicity and transparency.

## Conclusion

All acceptance criteria satisfied. The homepage is a static HTML document built from `homePage()` into `dist/index.html`, with build-time-fresh docket data, an empty content slot, and the supporting helpers needed to make the data correct at every build. The build is deterministic given a fixed build date. Unit tests and e2e tests cover all specified behaviors. No deviations from the spec.

---

## QA pass — 2026-05-06T14:55:44Z

**Executed:** 2026-05-06T14:55:44Z
**Agent:** claude (qa role, model: claude-sonnet-4-5)
**Test coverage:** Unit tests, e2e tests, build verification, preview server, acceptance criteria

### Verification approach

QA verification involved five stages:

1. **Unit test execution** — Ran `pnpm test:unit` to verify all three helper functions against their spec requirements
2. **Build verification** — Ran `pnpm build` and inspected `dist/` outputs for correctness and completeness
3. **E2E test execution** — Ran `pnpm test:e2e e2e/home.spec.ts` to verify homepage rendering against acceptance criteria
4. **Preview server testing** — Started `pnpm preview` and manually verified the site serves correctly at `http://localhost:4173/`
5. **Acceptance criteria mapping** — Cross-referenced all spec acceptance criteria against test coverage and file inspection

### Checks executed

#### Unit tests: ✅ **26/26 PASSED**

All helper function unit tests passed on first execution with no modifications required:

- **`formatDocketDate`** (7 tests): midnight, noon, end-of-day, early morning, UTC vs Budapest timezone conversion, all seven day names uppercase English, default timezone parameter
- **`isUnitOpen`** (9 tests): 23:00 open, 22:00 boundary open, 04:30 open, 04:59:59 open, 05:00 boundary closed, 12:00 closed, 09:00 closed, 21:59:59 closed, Sunday treatment, default timezone
- **`generateDktRef`** (10 tests): W19 for May 2026, format pattern validation, year boundaries (Jan 1 2027 → W53 2026, Dec 29 2025 → W01 2026, Dec 31 2026 → W53 2026), week number progression, fixed `-001` suffix, default timezone, timezone differences

All edge cases required by the spec are covered and pass.

#### Build process: ✅ **SUCCESS**

```
Generated index.html at 2026-05-06T14:52:13.174Z (build date: wall-clock)
dist/index.html                 1.36 kB │ gzip: 0.59 kB
dist/assets/index-CquX1fMU.css  5.27 kB │ gzip: 1.98 kB
dist/assets/index-COAHC_o2.js   0.71 kB │ gzip: 0.40 kB
```

The build:
- Runs the pre-build script (`build/generate-index.ts`) which generates `index.html` at the repository root
- Processes the generated HTML through Vite, injecting the bundled stylesheet link
- Produces deterministic output given the same `BUILD_DATE` environment variable
- Exits with code 0

#### E2E tests: ✅ **11/11 PASSED**

All homepage acceptance criteria covered by automated Playwright tests:

- **S-E2E-01:** `/` returns 200 ✅
- **S-E2E-02:** Page title correct (`Vinyl Traffic — Industrial Record Dispatch`) ✅
- **S-E2E-03:** Docket strip renders as first body block ✅
- **S-E2E-04:** Date label matches canonical format pattern `DDD DD.MM.YYYY / HH:MM` ✅
- **S-E2E-05:** DKT ref matches pattern `DKT-YYYY-Www-001` ✅
- **S-E2E-06:** Unit label exactly `UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX` ✅
- **S-E2E-07:** Open/closed state consistent with `__pulse` element presence/absence ✅
- **S-E2E-08:** `<main>` element exists and is empty ✅
- **S-E2E-09:** Bundled stylesheet linked with content-hashed filename ✅
- **S-E2E-10:** Font preloads present (Special Elite, JetBrains Mono) ✅
- **S-E2E-11:** Page wrapper structure correct (`.page` > `.docket-strip` + `<main>`) ✅

Tests execute against `pnpm preview` server on `http://localhost:4173/`. All tests passed on first execution.

#### Preview server: ✅ **VERIFIED**

- Server starts successfully on port 4173
- Homepage served at `/` with correct structure
- Docket strip visible with build-time data:
  - Date: `WED 06.05.2026 / 16:52` (Budapest local time)
  - DKT ref: `DKT-2026-W19-001`
  - Status: `UNIT CLOSED` (16:52 is outside 22:00-04:59 open hours)
  - Unit label: `UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX`
- Empty `<main>` element present
- Bundled CSS applied correctly

### Acceptance criteria verification

All seven acceptance criteria from the spec are satisfied:

- ✅ **AC-01:** `src/templates/pages/home.ts` exists and implements *The homepage template*
  - **Verified by:** File inspection at `src/templates/pages/home.ts:1-50`
  - Imports: `basePage` from `./base`, three helpers from `build/lib/`
  - Interface: `HomePageContext` with `buildDate: Date`
  - Data flow: computes `dateLabel`, `open`, `dktRef`, hard-codes `unitLabel`, constructs `BasePageData` with empty `children`
  - Returns: `basePage(data)`

- ✅ **AC-02:** Build helpers exist and implement spec requirements
  - **Verified by:** File inspection and unit tests (26/26 passed)
  - `build/lib/date-format.ts:1-49` — canonical format, `Intl.DateTimeFormat`, Europe/Budapest default
  - `build/lib/unit-open.ts:1-38` — `>= 22 || < 5` logic, `Intl.DateTimeFormat`, Europe/Budapest default
  - `build/lib/dkt-ref.ts:1-69` — ISO 8601 week date algorithm, fixed `-001` suffix, Europe/Budapest default

- ✅ **AC-03:** `pnpm build` produces `dist/index.html` with required content
  - **Verified by:** Build execution and file inspection at `dist/index.html:1-32`
  - Title: `Vinyl Traffic — Industrial Record Dispatch` (line 7)
  - Docket strip: first visible block in body (lines 15-28)
  - Build-time date: `WED 06.05.2026 / 16:52` (line 24)
  - DKT ref: `DKT-2026-W19-001` (line 21)
  - Open/closed state: `UNIT CLOSED` (line 18, no `__pulse` element — correct for 16:52)
  - Empty `<main>`: line 29
  - Bundled stylesheet: `/assets/index-CquX1fMU.css` (line 11)
  - Font preloads: lines 8-9

- ✅ **AC-04:** `pnpm preview` serves the built site
  - **Verified by:** Manual curl test and e2e tests
  - Server starts on `:4173`, `/` returns 200, serves `dist/index.html`

- ✅ **AC-05:** `e2e/home.spec.ts` covers required scenarios
  - **Verified by:** File inspection at `e2e/home.spec.ts:1-131` and test execution (11/11 passed)
  - All six spec-required test cases present: 200 response, docket strip first block, date format pattern, DKT pattern, unit label exact match, open/closed state consistency
  - Additional coverage: title, empty main, stylesheet link, font preloads, page structure

- ✅ **AC-06:** `pnpm test:unit` exits 0
  - **Verified by:** Test execution (exit code 0, 26/26 passed, duration 1551ms)
  - All three spec-required coverage areas present:
    - `formatDocketDate`: midnight, noon, end-of-day, UTC vs Budapest timezone
    - `isUnitOpen`: 23:00 true, 12:00 false, 04:30 true, 09:00 false
    - `generateDktRef`: year boundaries (Jan 1 2027 → W53 2026)

- ✅ **AC-07:** `provenance.md` exists and documents build wiring
  - **Verified by:** File inspection at `sdd/specs/site/pages/home/provenance.md:1-227`
  - Build wiring approach: pre-build script (`build/generate-index.ts`), documented with rationale and trade-offs (lines 38-49)
  - Deviations: none (lines 71-81)

### Implementation fidelity

Verified the implementation matches the spec exactly:

| Spec requirement | Implementation | Status |
| ---------------- | -------------- | ------ |
| Date format `DDD DD.MM.YYYY / HH:MM` | `build/lib/date-format.ts:48` produces exact format | ✅ Exact |
| Unit open hours `>= 22 or < 5` | `build/lib/unit-open.ts:37` implements exact logic | ✅ Exact |
| DKT format `DKT-YYYY-Www-001` | `build/lib/dkt-ref.ts:68` produces exact format | ✅ Exact |
| Fixed `-001` suffix | `dkt-ref.ts:68` always returns `-001` | ✅ Exact |
| Unit label hard-coded | `src/templates/pages/home.ts:35` exact string | ✅ Exact |
| Title string | `home.ts:39` matches spec | ✅ Exact |
| Empty `children` | `home.ts:46` empty string | ✅ Exact |
| No external dependencies | All helpers use only `Intl.DateTimeFormat` | ✅ Confirmed |
| Default timezone Europe/Budapest | All three helpers default correctly | ✅ Confirmed |

### Findings

#### Positive findings

1. **Zero defects:** No functional defects, spec deviations, or failing tests found. All 37 automated tests passed on first execution (26 unit + 11 e2e).

2. **Comprehensive test coverage:** Tests cover all spec requirements plus edge cases (timezone boundaries, year boundaries, open/close boundaries). Test scenarios documented in `sdd/specs/site/pages/home/scenarios.md`.

3. **Clean implementation:** Helpers are well-commented with spec references. No external dependencies as required. Uses only standard `Intl.DateTimeFormat` APIs.

4. **Build determinism verified:** The `BUILD_DATE` environment variable mechanism works correctly. Same input produces same output.

5. **ISO week date correctness:** The `generateDktRef` implementation correctly handles year-boundary edge cases (Jan 1 2027 → W53 2026, Dec 29 2025 → W01 2026), verified by unit tests.

6. **Timezone handling:** All three helpers correctly handle timezone conversions and default to Europe/Budapest as specified.

7. **Documentation quality:** Dev provenance is comprehensive with rationale for decisions, trade-offs documented, and validation results recorded. No ambiguity about what was built or why.

#### No negative findings

No defects, spec gaps, or implementation issues identified. The homepage spec is fully satisfied and production-ready.

### Test artifacts

**Created files:**
- `sdd/specs/site/pages/home/scenarios.md` — 37 test scenarios documented (unit tests, build process, e2e tests, acceptance criteria mapping)

**Test outputs:**
- Unit tests: 26/26 passed, 0 failed, 0 skipped (duration 1551ms)
- E2E tests: 11/11 passed, 0 failed, 0 skipped (duration 14.9s)
- Build: exit code 0, outputs match spec requirements
- Preview: server functional, homepage renders correctly

### Recommendations

1. **Stability:** The three helper functions (`formatDocketDate`, `isUnitOpen`, `generateDktRef`) are suitable for reuse in future page specs. Consider their APIs stable unless a spec explicitly modifies them.

2. **Fixed `-001` suffix:** As documented in the spec and dev provenance, the DKT ref's `-001` suffix is intentionally fixed. When a future spec introduces a real build counter, only `generateDktRef` needs updating; the signature remains stable.

3. **Build date override:** The `BUILD_DATE` environment variable is useful for testing specific open/closed states in CI. Example: `BUILD_DATE="2026-05-06T23:00:00Z" pnpm build` produces a homepage showing "UNIT OPEN".

4. **Test maintenance:** The e2e tests use Playwright 1.50.1. The pinned version aligns with the agent container's shared Chromium. Maintain version alignment when upgrading to avoid duplicate browser downloads.

### QA conclusion

The homepage implementation fully satisfies all acceptance criteria from `sdd/specs/site/pages/home/spec.md`. All 37 automated tests pass. No defects found. No spec deviations. The implementation is production-ready and approved for merge.
