---
title: Global CSS QA Scenarios
spec: sdd/specs/global-css
---

# Global CSS QA Scenarios

## Overview

This document describes the test scenarios executed to verify the global CSS specification implementation. All scenarios reference acceptance criteria from `sdd/specs/global-css/spec.md`.

## Test Files

- **Automated test suite**: `e2e/global-css.spec.ts` (Playwright)
- **Validator tests**: `build/run-validator-fixtures.ts` + `sdd/specs/global-css/validator-fixtures/`
- **Run command**: `pnpm test:e2e e2e/global-css.spec.ts`

## Scenario 1: CSS File Byte Identity

**ID**: `QA-GC-001`
**Intent**: Verify that all CSS files in `src/styles/` are byte-identical to authoritative sources in the spec directory
**Spec Reference**: Acceptance criteria 1, Implementation handoff § 1

**Steps**:
1. Compare `sdd/specs/global-css/tokens.css` with `src/styles/tokens.css` using `cmp`
2. Compare `sdd/specs/global-css/reset.css` with `src/styles/reset.css` using `cmp`
3. Compare `sdd/specs/global-css/base.css` with `src/styles/base.css` using `cmp`
4. Compare `sdd/specs/global-css/index.css` with `src/styles/index.css` using `cmp`

**Expected**: All four files are byte-identical (exit code 0 from `cmp`)

**Result**: ✅ **PASS** — All CSS files are byte-identical to spec sources

---

## Scenario 2: Font File Byte Identity

**ID**: `QA-GC-002`
**Intent**: Verify that all webfont files in `src/public/fonts/` are byte-identical to spec sources
**Spec Reference**: Acceptance criteria 2

**Steps**:
1. Compare each of the 8 font files from `sdd/specs/global-css/fonts/` with `src/public/fonts/`:
   - `special-elite-v20-latin-regular.woff2`
   - `anton-v27-latin-regular.woff2`
   - `stardos-stencil-v15-latin-regular.woff2`
   - `stardos-stencil-v15-latin-700.woff2`
   - `permanent-marker-v16-latin-regular.woff2`
   - `jetbrains-mono-v24-latin-regular.woff2`
   - `jetbrains-mono-v24-latin-500.woff2`
   - `jetbrains-mono-v24-latin-700.woff2`

**Expected**: All 8 font files are byte-identical

**Result**: ✅ **PASS** — All font files verified byte-identical using `cmp`

---

## Scenario 3: CSS Import Chain

**ID**: `QA-GC-003`
**Intent**: Verify that the application entry point imports the global CSS
**Spec Reference**: Acceptance criteria 3

**Steps**:
1. Read `src/main.ts`
2. Verify it contains `import './styles/index.css'`

**Expected**: Entry file imports the CSS bundle via index.css

**Result**: ✅ **PASS** — `src/main.ts` imports `./styles/index.css`

---

## Scenario 4: Vite Public Directory Configuration

**ID**: `QA-GC-004`
**Intent**: Verify that Vite is configured to copy static assets from `src/public/`
**Spec Reference**: Acceptance criteria 4

**Steps**:
1. Read `vite.config.ts`
2. Verify `publicDir: 'src/public'` is set

**Expected**: Configuration directive present

**Result**: ✅ **PASS** — `vite.config.ts` contains `publicDir: 'src/public'`

---

## Scenario 5: Production Build Output

**ID**: `QA-GC-005`
**Intent**: Verify that `pnpm build` produces a complete distribution with CSS and fonts
**Spec Reference**: Acceptance criteria 5, 6

**Steps**:
1. Run `pnpm build`
2. Verify validator runs before Vite build (see validator scenario)
3. Check `dist/` contains:
   - `index.html`
   - Content-hashed CSS bundle under `assets/` (e.g., `index-DkZi8KG2.css`)
   - All 8 font files under `fonts/` with correct filenames

**Expected**: Build succeeds, CSS bundle present, fonts copied to `dist/fonts/`

**Result**: ✅ **PASS**
- Build output: `dist/index.html`, `dist/assets/index-DkZi8KG2.css`, `dist/assets/index-bMDpPsCj.js`
- CSS bundle: 4.10 kB (gzip: 1.61 kB)
- All 8 fonts present in `dist/fonts/`

---

## Scenario 6: Token Validator — Main Run

**ID**: `QA-GC-006`
**Intent**: Verify that the token validator successfully validates the real design-system.md against tokens.css
**Spec Reference**: Acceptance criteria 8, 9

**Steps**:
1. Run `pnpm validate:tokens`
2. Verify exit code 0
3. Run `pnpm lint` (which chains the validator)
4. Verify exit code 0
5. Run `pnpm build` and verify validator runs first

**Expected**: Validator passes on committed files

**Result**: ✅ **PASS**
- `pnpm validate:tokens` exits 0
- `pnpm lint` exits 0 (ESLint + validator)
- `pnpm build` runs validator first, then Vite build
- All 29 tokens from `sdd/context/design-system.md` Token tables match `src/styles/tokens.css`

---

## Scenario 7: Token Validator — Fixture Tests

**ID**: `QA-GC-007`
**Intent**: Verify that the validator correctly detects all failure modes using deterministic fixtures
**Spec Reference**: Acceptance criteria 10, Token validator § negative tests

**Steps**:
1. Run `pnpm test:validator`
2. Verify driver processes all 4 fixtures:
   - `pass-baseline` — expects validator exit 0
   - `fail-missing-in-css` — expects validator non-zero (missing token)
   - `fail-extra-in-css` — expects validator non-zero (extra token)
   - `fail-value-mismatch` — expects validator non-zero (wrong value)

**Expected**: Driver exits 0, all fixtures produce expected validator exit codes

**Result**: ✅ **PASS**
- Output: `validator fixtures: ok`
- All 4 fixtures passed with correct exit codes
- Fixtures cover all specified failure modes without mutating real `tokens.css`

---

## Scenario 8: E2E — CSS Files Present in Built Assets

**ID**: `QA-GC-008`
**Intent**: Verify that the built HTML includes a CSS bundle link
**Spec Reference**: Acceptance criteria 5

**Test**: `e2e/global-css.spec.ts` › "CSS files are present in built assets"

**Steps**:
1. Navigate to `http://localhost:4173/`
2. Locate `link[rel="stylesheet"]` elements
3. Assert at least one CSS link present

**Expected**: Built HTML contains CSS link

**Result**: ✅ **PASS** — CSS bundle link present in `dist/index.html`

---

## Scenario 9: E2E — :root Custom Properties

**ID**: `QA-GC-009`
**Intent**: Verify that CSS custom properties from tokens.css are exposed on :root
**Spec Reference**: Acceptance criteria 7, 11

**Test**: `e2e/global-css.spec.ts` › ":root custom properties match design-system.md tokens"

**Steps**:
1. Navigate to `http://localhost:4173/`
2. Wait for CSS to load (`networkidle`)
3. Read computed style for `document.documentElement`:
   - `--paper` → expect `#ece6d4`
   - `--ink` → expect `#1a1410`
   - `--orange` → expect `#c95028`
   - `--gutter` → expect contains `clamp`

**Expected**: All token values match design-system.md

**Result**: ✅ **PASS** — All checked custom properties match design-system table values

---

## Scenario 10: E2E — Body Background and Font

**ID**: `QA-GC-010`
**Intent**: Verify that the body element uses paper background and Special Elite font
**Spec Reference**: Acceptance criteria 7, base.css § Body

**Test**: `e2e/global-css.spec.ts` › "body uses paper background and Special Elite font"

**Steps**:
1. Navigate to `http://localhost:4173/`
2. Await `document.fonts.ready` to avoid font loading race
3. Read body computed styles:
   - `backgroundColor` → expect `rgb(236, 230, 212)` (equivalent to `#ece6d4`)
   - `fontFamily` → expect includes "Special Elite"

**Expected**: Body has paper background and Special Elite font applied

**Result**: ✅ **PASS** — Body background matches paper token RGB; font family includes Special Elite

---

## Scenario 11: E2E — Heading Font Family

**ID**: `QA-GC-011`
**Intent**: Verify that heading elements use Anton font family
**Spec Reference**: Acceptance criteria 7, base.css § Headings h1–h4

**Test**: `e2e/global-css.spec.ts` › "headings use Anton font family"

**Steps**:
1. Navigate to `http://localhost:4173/`
2. Create test `<h1>` and `<h2>` elements
3. Await `document.fonts.ready`
4. Read computed `fontFamily` for each heading
5. Assert font family includes "Anton"

**Expected**: All headings use Anton font

**Result**: ✅ **PASS** — Both h1 and h2 computed styles include Anton in font-family

---

## Scenario 12: E2E — @font-face Declarations in Built CSS

**ID**: `QA-GC-012`
**Intent**: Verify that the built CSS bundle contains @font-face declarations for all families
**Spec Reference**: Acceptance criteria 11, base.css § @font-face

**Test**: `e2e/global-css.spec.ts` › "built CSS contains @font-face declarations"

**Steps**:
1. Read `dist/index.html` to extract CSS bundle filename
2. Read the CSS bundle from `dist/assets/*.css`
3. Assert CSS content includes:
   - `@font-face` keyword
   - "Special Elite" family name
   - `/fonts/special-elite-v20-latin-regular.woff2` URL
   - "Anton" family name
   - `/fonts/anton-v27-latin-regular.woff2` URL
   - "JetBrains Mono" family name
   - `/fonts/jetbrains-mono-v24-latin-regular.woff2` URL

**Expected**: All checked @font-face rules present in bundled CSS

**Result**: ✅ **PASS** — CSS bundle contains @font-face declarations for Special Elite, Anton, and JetBrains Mono with correct woff2 paths

---

## Scenario 13: E2E — Font File HTTP Accessibility

**ID**: `QA-GC-013`
**Intent**: Verify that all font files are accessible via HTTP at runtime
**Spec Reference**: Acceptance criteria 6

**Test**: `e2e/global-css.spec.ts` › "font files are accessible in dist/fonts/"

**Steps**:
1. For each of the 8 font files, request `http://localhost:4173/fonts/<filename>.woff2`
2. Assert HTTP status 200
3. Assert `Content-Type` header is `font/woff2` or `application/octet-stream`

**Expected**: All 8 fonts return HTTP 200

**Result**: ✅ **PASS** — All 8 font files accessible at `/fonts/*.woff2` with correct Content-Type headers

---

## Scenario 14: E2E — document.fonts.ready

**ID**: `QA-GC-014`
**Intent**: Verify that the browser's Font Loading API resolves successfully
**Spec Reference**: Acceptance criteria 11, Playwright § font assertions

**Test**: `e2e/global-css.spec.ts` › "document.fonts.ready resolves successfully"

**Steps**:
1. Navigate to `http://localhost:4173/`
2. Await `document.fonts.ready`
3. Assert `document.fonts.status` is `"loaded"`

**Expected**: Fonts load successfully and API reports loaded status

**Result**: ✅ **PASS** — `document.fonts.status` is "loaded"

---

## Scenario 15: E2E — prefers-reduced-motion

**ID**: `QA-GC-015`
**Intent**: Verify that animations and transitions respect prefers-reduced-motion media query
**Spec Reference**: Acceptance criteria 11, reset.css / base.css § prefers-reduced-motion

**Test**: `e2e/global-css.spec.ts` › "prefers-reduced-motion is respected"

**Steps**:
1. Navigate to `http://localhost:4173/`
2. Emulate `reducedMotion: 'reduce'` via Playwright
3. Create a test `<div>` with `transition: all 1s`
4. Read computed `transitionDuration`
5. Assert duration is near-zero (matches regex for `0.01ms` or scientific notation like `1e-05s`)

**Expected**: Transition duration forced to near-zero under reduced motion

**Result**: ✅ **PASS** — Transition duration matches near-zero pattern (scientific notation `1e-05s`)

---

## Summary

**Total scenarios**: 15
**Passed**: 15
**Failed**: 0
**Skipped**: 0

All acceptance criteria from the spec have been verified. The implementation is complete, byte-identical to spec sources, and ready for production.

### Test Execution Commands

```bash
# Run all QA checks
pnpm validate:tokens          # Token synchronisation validator
pnpm test:validator           # Validator fixture tests
pnpm lint                     # ESLint + validator
pnpm build                    # Full production build with validator
pnpm test:e2e e2e/global-css.spec.ts  # Playwright e2e tests

# Single combined test run
pnpm test                     # Alias for pnpm test:e2e
```

### Coverage Gaps

None identified. All spec acceptance criteria have corresponding automated verification.

### Notes

- Font loading tests use `document.fonts.ready` to avoid flaky assertions
- Validator fixtures provide deterministic failure mode coverage without mutating tracked `tokens.css`
- All 29 design-system tokens are validated at build time
- CSS byte-identity verified via `cmp` for transport correctness
