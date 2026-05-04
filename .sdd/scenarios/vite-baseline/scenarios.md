---
title: vite-baseline QA scenarios
spec: vite-baseline
executed: 2026-05-04T13:46:00Z
---

# QA Scenarios — vite-baseline

## Overview

This document describes automated end-to-end test scenarios for the vite-baseline spec. Tests are implemented using Playwright and can be run via `pnpm test:e2e`.

**Test suite location:** `e2e/vite-baseline.spec.ts`

**Run command:** `pnpm test:e2e`

**Results:** 6/6 automated checks in the Playwright suite pass (SC-03 retired — see below).

---

## SC-01: Page loads successfully with 200 status

**Spec reference:** `.sdd/specifications/vite-baseline/spec.md` line 57 (acceptance criteria)

**Intent:** Verify the built application serves the index page with HTTP 200 status.

**Implementation:** Playwright test navigates to `/` and asserts response status equals 200.

**Steps:**
1. Start vite preview server on port 5173 (via playwright.config.ts webServer)
2. Navigate to `http://localhost:5173/`
3. Assert response status is 200

**Expected:** HTTP 200 response

**Actual:** ✓ **PASS** — Page loads with status 200 (4.0s)

**File:** `e2e/vite-baseline.spec.ts:4-7`

---

## SC-02: HTML document is served (content-type header)

**Spec reference:** `.sdd/specifications/vite-baseline/spec.md` line 57 (acceptance criteria)

**Intent:** Verify the response is served as HTML with correct content-type header.

**Implementation:** Playwright test checks response headers for `content-type: text/html`.

**Steps:**
1. Navigate to `/`
2. Extract content-type header from response
3. Assert header contains "text/html"

**Expected:** Content-type header contains "text/html"

**Actual:** ✓ **PASS** — Content-type header correct (4.8s)

**File:** `e2e/vite-baseline.spec.ts:9-13`

---

## SC-03: (retired) "Vite baseline" string

**Status:** Removed from the Playwright suite. The repo root page is now product content (e.g. homepage spec); the literal **vite-baseline** smoke string is no longer asserted in e2e. The **vite-baseline** spec document still describes the original placeholder contract for historical/toolchain context.

---

## SC-04: CSS assets are loaded

**Spec reference:** `.sdd/specifications/vite-baseline/spec.md` line 56 (dist/ with assets)

**Intent:** Verify the build process includes CSS assets and they are loaded by the browser.

**Implementation:** Playwright test checks computed styles on the body element to confirm CSS has been applied.

**Steps:**
1. Navigate to `/`
2. Wait for page load
3. Execute JavaScript to read `window.getComputedStyle(document.body).backgroundColor`
4. Assert background color is set (not transparent/initial)

**Expected:** Body element has computed background color from CSS

**Actual:** ✓ **PASS** — CSS loaded and applied (4.5s)

**File:** `e2e/vite-baseline.spec.ts:15-26`

---

## SC-05: JavaScript module is loaded

**Spec reference:** `.sdd/specifications/vite-baseline/spec.md` lines 32 (TypeScript entry), 56 (build output)

**Intent:** Verify the TypeScript entry point is built and loaded as a module script.

**Implementation:** Playwright test counts `<script type="module">` tags in the DOM.

**Steps:**
1. Navigate to `/`
2. Query DOM for `script[type="module"]` elements
3. Assert count is greater than zero

**Expected:** At least one module script present

**Actual:** ✓ **PASS** — Module script loaded (5.0s)

**File:** `e2e/vite-baseline.spec.ts:28-34`

---

## SC-06: Page has proper HTML structure

**Spec reference:** `.sdd/specifications/vite-baseline/spec.md` line 31 (HTML entry)

**Intent:** Verify basic HTML document structure with required metadata.

**Implementation:** Playwright test checks for `lang` attribute, charset meta, and viewport meta.

**Steps:**
1. Navigate to `/`
2. Assert `<html>` element has `lang` attribute
3. Assert `<head>` contains one `<meta charset>` tag
4. Assert `<head>` contains one `<meta name="viewport">` tag

**Expected:** HTML document has proper structure and metadata

**Actual:** ✓ **PASS** — HTML structure correct (4.9s)

**File:** `e2e/vite-baseline.spec.ts:36-43`

---

## SC-07: No console errors on page load

**Spec reference:** Implicit acceptance criterion (build quality)

**Intent:** Verify the page loads without JavaScript errors in the browser console.

**Implementation:** Playwright test listens to console events and collects error messages, then asserts the list is empty.

**Steps:**
1. Set up console event listener before navigation
2. Navigate to `/`
3. Wait for network idle
4. Assert no console error messages were logged

**Expected:** Zero console errors

**Actual:** ✓ **PASS** — No console errors (1.6s)

**File:** `e2e/vite-baseline.spec.ts:45-61`

---

## Summary

| Scenario | Result | Duration | Severity |
|----------|--------|----------|----------|
| SC-01: Page loads with 200 status | ✓ PASS | 4.0s | — |
| SC-02: HTML content-type header | ✓ PASS | 4.8s | — |
| SC-03: (retired) | — | — | — |
| SC-04: CSS assets loaded | ✓ PASS | 4.5s | — |
| SC-05: JavaScript module loaded | ✓ PASS | 5.0s | — |
| SC-06: HTML structure proper | ✓ PASS | 4.9s | — |
| SC-07: No console errors | ✓ PASS | 1.6s | — |

**Total:** 6 passed, 0 failed, 0 skipped (SC-03 not executed — removed from suite)

**Test execution time:** ~16s (order may vary with parallelism)

**Note:** SC-03 was dropped from `e2e/vite-baseline.spec.ts` because the live homepage copy no longer targets the original placeholder string; toolchain checks remain in SC-01–SC-02 and SC-04–SC-07.

## Reproducibility

All tests are automated and reproducible. To run:

```bash
# From repository root
pnpm install
pnpm build
pnpm test:e2e
```

**Environment:**
- Node 22
- pnpm 10.33.2
- @playwright/test 1.59.1
- Chromium browser (Playwright-managed)

**Note:** The first test run after adding @playwright/test required `pnpm exec playwright install chromium` to download browser binaries (170 MB). Subsequent runs reuse the downloaded browsers.

## Recommendations

1. **Run tests in CI:** Add `pnpm test:e2e` to the workflow after `pnpm build` to catch regressions.

2. **Spec vs product copy:** If the **vite-baseline** spec’s literal "Vite baseline" placeholder is still required for new greenfield runs, track that in the spec or a follow-up ticket; the current e2e suite intentionally does not assert it on the shipped homepage.
