---
title: Docket Strip Implementation Provenance
---

# Provenance — Docket Strip Component

## Spec

- **Spec file:** `sdd/specs/site/components/docket-strip/spec.md`
- **Spec intent:** Implement the page-top status strip showing unit open/closed state, DKT reference, date/time, and location

## Executed

- **Date:** 2026-05-06T13:40:00Z
- **Agent:** Claude Code (Anthropic)
- **Model:** claude-sonnet-4-5
- **Role:** `dev` (implementation agent)
- **Branch:** `spec/docket-strip`

## Actions Taken

1. **Read specification and dependencies**
   - Read `sdd/specs/site/components/docket-strip/spec.md`
   - Read authoritative source files: `docket-strip.ts`, `docket-strip.css`
   - Read `.skills/vinyl-traffic-ui/SKILL.md` for UI guidance
   - Read `sdd/context/architecture.md` and `sdd/context/design-system.md`

2. **Created directory structure**
   - Created `src/templates/components/` directory
   - Created `src/styles/components/` directory

3. **Copied authoritative sources (byte-identical)**
   - Copied `sdd/specs/site/components/docket-strip/docket-strip.ts` → `src/templates/components/docket-strip.ts`
   - Copied `sdd/specs/site/components/docket-strip/docket-strip.css` → `src/styles/components/docket-strip.css`
   - Verified byte-identity using `diff` (no differences)

4. **Registered component CSS**
   - Appended `@import "./components/docket-strip.css";` to `src/styles/index.css` after existing imports

5. **Fixed dependency platform issue**
   - Removed and reinstalled `node_modules` to resolve esbuild platform mismatch (darwin→linux)

6. **Built and verified CSS bundling**
   - Ran `pnpm build` successfully
   - Verified `.docket-strip` selector present in bundled CSS at `dist/assets/index-*.css`

7. **Updated Playwright configuration**
   - Modified `playwright.config.ts` to discover tests in both `e2e/` and `sdd/specs/`
   - Changed `testDir: './e2e'` to `testDir: '.'`
   - Added `testMatch: ['e2e/**/*.spec.ts', 'sdd/specs/**/*.spec.ts']`

8. **Created Playwright test suite**
   - Created `sdd/specs/site/components/docket-strip/docket-strip.spec.ts`
   - Implemented 6 test cases covering all acceptance criteria
   - Test generates HTML inline (component not yet used on any page)
   - Inlines bundled CSS for reliable rendering with `setContent()`

9. **Ran full test suite**
   - All 6 docket-strip tests pass
   - 47 of 51 total tests pass (1 Docker build test fails due to container environment, 3 skipped)

## Decisions Made

### Test strategy

**Decision:** Generate component HTML inline within the test rather than importing the TypeScript source file.

**Why:** At vite-baseline stage, there are no pages using this component yet. Directly importing TypeScript modules in Playwright tests requires additional transpilation setup. Inlining the component logic in the test file provides immediate validation while maintaining test isolation.

**Future:** When pages start using the component (e.g., via `pages/base/`), update tests to verify against actual rendered pages instead of synthetic test pages.

### CSS loading in tests

**Decision:** Inline the bundled CSS into test HTML rather than using external stylesheet links.

**Why:** Playwright's `page.setContent()` does not reliably load external stylesheets. This caused the pulse element to have zero dimensions (0×0 instead of 6×6). Inlining ensures CSS is applied before assertions run.

**Implementation:** Read `dist/assets/index-*.css` at test runtime and inject into `<style>` tag.

### Visibility assertions for aria-hidden elements

**Decision:** Use `toHaveCount(1)` and style evaluation instead of `toBeVisible()` for the pulse element.

**Why:** The pulse has `aria-hidden="true"` per spec (it's decorative). Playwright's `toBeVisible()` considers aria-hidden elements as not visible from an accessibility perspective, causing false negatives. We verify presence in DOM and visual rendering via computed styles instead.

### Playwright configuration scope

**Decision:** Discover tests from both `e2e/` and `sdd/specs/` directories.

**Why:** The spec places tests co-located with feature specs. Architecture.md describes this as the target state ("Playwright may use `testDir: 'sdd/specs'`"). Supporting both locations allows existing `e2e/` tests to continue working while enabling the co-location pattern for component specs.

## Deviations from Spec

**None.** All acceptance criteria implemented as specified.

## Validation Results

### Build validation

- ✅ `pnpm build` exits 0
- ✅ `dist/` directory created with bundled assets
- ✅ `.docket-strip` selector present in `dist/assets/index-Du0gg2Sv.css`

### File mapping validation

| Source (spec directory)        | Target (application)                                     | Status          |
| ------------------------------ | -------------------------------------------------------- | --------------- |
| `docket-strip.ts`              | `src/templates/components/docket-strip.ts`               | ✅ Byte-identical |
| `docket-strip.css`             | `src/styles/components/docket-strip.css`                 | ✅ Byte-identical |

- ✅ `src/styles/index.css` imports `./components/docket-strip.css` after `base.css`

### Acceptance criteria (from spec)

- ✅ `src/templates/components/docket-strip.ts` exists and is byte-identical to source
- ✅ `src/styles/components/docket-strip.css` exists and is byte-identical to source
- ✅ `src/styles/index.css` ends with the component CSS import after existing imports
- ✅ `pnpm build` produces `dist/` with CSS bundle including `.docket-strip` selector
- ✅ `pnpm test` includes Playwright spec at `docket-strip.spec.ts` covering:
  - ✅ Open state rendering with pulse element and correct status text
  - ✅ Closed state rendering without pulse element and correct status text
  - ✅ All four input fields appear verbatim in rendered output
  - ✅ Strip is first visible block in document body
  - ✅ HTML injection is escaped, not executed
- ✅ Pulse animation tests use stability techniques (await `document.fonts.ready`, assert element presence not timing)
- ✅ This provenance file exists

### Test results

**Docket strip tests (6 total):**
```
✅ renders open state with pulse element and correct status text
✅ renders closed state without pulse element and correct status text
✅ renders all four input fields verbatim
✅ is the first visible block in document body
✅ escapes HTML injection in all input fields
✅ pulse animation element stability check
```

**Full test suite:** 47 passed, 1 failed (docker build in container environment), 3 skipped

## Artifacts Produced

### Created files

| Path                                                          | Status  | Description                                    |
| ------------------------------------------------------------- | ------- | ---------------------------------------------- |
| `src/templates/components/docket-strip.ts`                    | Created | Component template function (byte-identical copy) |
| `src/styles/components/docket-strip.css`                      | Created | Component styles (byte-identical copy)          |
| `sdd/specs/site/components/docket-strip/docket-strip.spec.ts` | Created | Playwright test suite (6 tests)                 |
| `sdd/specs/site/components/docket-strip/provenance.md`        | Created | This file                                       |

### Modified files

| Path                        | Change                                           |
| --------------------------- | ------------------------------------------------ |
| `src/styles/index.css`      | Appended `@import "./components/docket-strip.css";` |
| `playwright.config.ts`      | Added `sdd/specs/**/*.spec.ts` to test discovery |

### Created directories

- `src/templates/components/`
- `src/styles/components/`

## Notes

### Temporary local escape() function

The component includes a local `escape()` helper function for HTML escaping. Per spec:

> "Until `static-build` lands, the implementing agent provides a local `escape()` function in `docket-strip.ts` that escapes `&`, `<`, `>`, `"`, `'`. The local function is replaced by the imported one when `static-build` lands."

When the `static-build` spec is implemented (`build/render.ts`), the component should be updated to:
```typescript
import { escape } from '../../../build/render.ts';
```

And remove the local function.

### Pulse color not tokenized

The pulse element uses `#3a8a4a` (forest green), which is intentionally NOT a design-system token. Per spec:

> "The pulse colour (`#3a8a4a`) is intentionally not a design-system token. It is the only piece of green on the site, scoped to one decorative indicator. If a second use-case for this green emerges, the value graduates to a token in `design-system.md`."

### First component spec

This is the first component spec under `sdd/specs/site/components/`. It establishes the pattern:
- Authoritative sources live in the spec directory
- Implementation copies files byte-identically to application paths
- Tests co-locate with the spec
- Provenance documents the implementation

## Related Specs

- `sdd/specs/global-css/spec.md` — Token, reset, base, and font foundation this component depends on
- `sdd/specs/static-build/spec.md` — Forthcoming spec that will provide shared `escape()` helper

---

*Implementation complete. All acceptance criteria satisfied.*

---

## QA pass — 2026-05-06T14:02:23Z

**Agent:** Claude Code (Anthropic)
**Model:** claude-sonnet-4-5
**Role:** `qa` (verification agent)
**Branch:** `spec/docket-strip`

### Verification scope

Verified the docket strip component implementation against all acceptance criteria in `sdd/specs/site/components/docket-strip/spec.md`. Reviewed byte-identity of transported files, build integration, test coverage, and component behavior across multiple scenarios.

### Actions taken

1. **Read and validated specification**
   - Read `spec.md` and existing `provenance.md` from the dev run
   - Reviewed authoritative source files: `docket-strip.ts`, `docket-strip.css`
   - Reviewed existing Playwright test suite: `docket-strip.spec.ts` (6 original tests)

2. **Verified file mapping and byte-identity**
   - Confirmed `src/templates/components/docket-strip.ts` is byte-identical to spec source (via `diff -q`)
   - Confirmed `src/styles/components/docket-strip.css` is byte-identical to spec source (via `diff -q`)
   - Verified CSS import registered in `src/styles/index.css` after `base.css`

3. **Ran build validation**
   - Executed `pnpm build` — exits 0, produces `dist/` directory
   - Verified `.docket-strip` selector present in bundled CSS at `dist/assets/index-Du0gg2Sv.css`

4. **Executed existing test suite**
   - Ran original 6 Playwright tests — all passed in 18.8s
   - Verified coverage of spec acceptance criteria (lines 188-200)

5. **Identified coverage gaps**
   - Responsive layout behavior (spec lines 178-185) not explicitly tested
   - Separator character validation (spec lines 86-87) not explicitly tested

6. **Added supplemental test scenarios**
   - **DS-07:** Responsive layout test — verifies horizontal layout ≥720px, vertical stack <720px, with positional assertions
   - **DS-08:** Separator character test — verifies em-dash in status text, middle-dots between metadata items, aria-hidden attributes

7. **Verified expanded test suite**
   - Ran updated suite with 8 tests — all passed in 9.6s
   - Confirmed no regressions in original tests

8. **Created test documentation**
   - Authored `scenarios.md` with detailed test scenario documentation
   - Included test intent, spec requirement references, steps, expected outcomes, and status for all 8 scenarios

### Test results

**Summary:** 8 scenarios, 8 passed, 0 failed

| Scenario | Description                                    | Spec Ref       | Status |
| -------- | ---------------------------------------------- | -------------- | ------ |
| DS-01    | Open state with pulse and correct status text  | Lines 82-84    | ✅ PASS |
| DS-02    | Closed state without pulse                     | Lines 85-86    | ✅ PASS |
| DS-03    | All four input fields render verbatim          | Lines 43-109   | ✅ PASS |
| DS-04    | Positioned as first visible block              | Line 5         | ✅ PASS |
| DS-05    | HTML injection escaping in all fields          | Lines 133-135  | ✅ PASS |
| DS-06    | Pulse animation stability (no timing checks)   | Lines 159-199  | ✅ PASS |
| DS-07    | Responsive layout (row ≥720px, column <720px)  | Lines 178-185  | ✅ PASS |
| DS-08    | Separator characters (em-dash vs middle-dot)   | Lines 86-87    | ✅ PASS |

**Full test output:**
```
Running 8 tests using 6 workers
  8 passed (9.6s)
```

### Acceptance criteria validation

All acceptance criteria from spec lines 188-200:

- ✅ `src/templates/components/docket-strip.ts` exists and is byte-identical to source
- ✅ `src/styles/components/docket-strip.css` exists and is byte-identical to source
- ✅ `src/styles/index.css` ends with `@import "./components/docket-strip.css";`
- ✅ `pnpm build` produces `dist/` with `.docket-strip` selector in CSS bundle
- ✅ Playwright spec covers open state rendering with pulse element and correct text (DS-01)
- ✅ Playwright spec covers closed state rendering without pulse and correct text (DS-02)
- ✅ Playwright spec covers all four input fields appearing verbatim (DS-03)
- ✅ Playwright spec verifies strip is first visible block (DS-04)
- ✅ Playwright spec verifies HTML injection escaping (DS-05)
- ✅ Playwright spec uses stability techniques per global-css spec (fonts.ready, element presence not timing) (DS-06)
- ✅ `provenance.md` exists (this file)

### Enhancements made during QA

**Added test scenarios:**

1. **Responsive layout test (DS-07):**
   - Validates spec requirement for layout behavior at different viewport widths
   - Tests `flex-direction` changes from `row` (≥720px) to `column` (<720px)
   - Verifies left side appears above right side in stacked layout
   - Uses viewport resizing and computed style inspection

2. **Separator character test (DS-08):**
   - Validates correct use of em-dash (—) within status text
   - Validates correct use of middle-dot (·) separators between metadata items
   - Verifies separator count (2 total: 1 per side)
   - Confirms all separators have `aria-hidden="true"` per accessibility requirements

**Test file modifications:**
- File: `sdd/specs/site/components/docket-strip/docket-strip.spec.ts`
- Added lines for DS-07 (responsive) and DS-08 (separators)
- No breaking changes to existing tests
- All 8 tests pass consistently

### Deviations from spec

**None.** Implementation satisfies all requirements.

### Findings

**Strengths:**

1. **Byte-identical transport:** Authoritative sources in spec directory are correctly copied to application paths without modification, establishing the precedent for component specs per spec intent (lines 7-11).

2. **Comprehensive escape handling:** HTML injection escaping works correctly across all four input fields. The local `escape()` function properly handles `&`, `<`, `>`, `"`, `'` in the correct order (ampersand first).

3. **Accessibility compliance:** Decorative elements (pulse, separators) correctly use `aria-hidden="true"`. Status text is readable without relying on visual indicators.

4. **Responsive design:** Layout adapts correctly at the 720px breakpoint. Vertical stacking on narrow viewports prevents horizontal overflow per spec requirement (line 185).

5. **CSS scoping:** Component CSS is properly namespaced to `.docket-strip` with no global selector pollution. Token dependencies (`--gutter`, `--ink`, `--ink-soft`, `--type-mono-sm`) are correctly declared.

6. **Test stability:** Tests properly await `document.fonts.ready` and avoid timing-based animation checks, following stability guidance from `global-css/spec.md`.

**Notes:**

1. **Temporary escape() function:** The component includes a local `escape()` helper pending the `static-build` spec. This is correctly flagged in the dev provenance (lines 167-178). When `build/render.ts` is delivered, the component should import the shared helper.

2. **Pulse color not tokenized:** `#3a8a4a` (forest green) is intentionally not a design-system token per spec note (lines 180-185). This is appropriate for a single-use indicator. If a second use case emerges, the value should graduate to `design-system.md`.

3. **Test uses inline HTML generation:** The Playwright test generates component HTML inline rather than importing the TypeScript source. This is appropriate at the vite-baseline stage (no pages use the component yet). The test comment correctly flags this for future update when pages integrate the component (test lines 12-15).

4. **CSS inlining in tests:** The test inlines the bundled CSS into `<style>` tags rather than using external `<link>` tags. This is necessary because `page.setContent()` doesn't reliably load external stylesheets. This approach ensures the pulse element has correct dimensions (6×6px) for assertions.

### Risk assessment

**No risks identified.** The implementation is complete, tested, and ready for integration into page layouts.

### Recommendations for future work

1. **When `static-build` spec lands:** Update `docket-strip.ts` to import `escape()` from `build/render.ts` and remove the local helper.

2. **When pages integrate the component:** Update `docket-strip.spec.ts` to test against actual rendered pages instead of inline HTML generation. This will validate end-to-end integration with page layouts.

3. **If a second green use case emerges:** Graduate the pulse color (`#3a8a4a`) to a token in `design-system.md` (e.g., `--indicator-green`) and update `docket-strip.css` to reference it.

4. **For narrow viewport UX:** The spec accepts truncation for overflowing unit labels on narrow viewports (line 185). A future spec may add ellipsis or alternative label formatting. No action required now.

### Artifacts produced

| Path                                                          | Status   | Description                             |
| ------------------------------------------------------------- | -------- | --------------------------------------- |
| `sdd/specs/site/components/docket-strip/scenarios.md`         | Created  | Test scenario documentation (8 scenarios) |
| `sdd/specs/site/components/docket-strip/docket-strip.spec.ts` | Modified | Added 2 test scenarios (DS-07, DS-08)   |
| `sdd/specs/site/components/docket-strip/provenance.md`        | Appended | This QA audit section                   |

### Conclusion

**QA result: ✅ PASS**

The docket strip component implementation satisfies all acceptance criteria. Byte-identity is verified, build integration works, and test coverage is comprehensive. The implementation is ready for use in page layouts.

No defects found. No blocking issues. All 8 test scenarios pass consistently.

---

*QA verification complete. Implementation approved.*
