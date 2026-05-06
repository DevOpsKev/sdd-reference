---
title: Docket Strip Test Scenarios
spec: sdd/specs/site/components/docket-strip
---

# Test Scenarios — Docket Strip Component

## Overview

Automated test suite verifying the docket strip component against the specification at `sdd/specs/site/components/docket-strip/spec.md`. All scenarios are implemented as runnable Playwright tests in `docket-strip.spec.ts`, executable via `pnpm test sdd/specs/site/components/docket-strip/docket-strip.spec.ts`.

**Test framework:** Playwright (Chromium)
**Test file:** `sdd/specs/site/components/docket-strip/docket-strip.spec.ts`
**Package script:** `pnpm test:e2e`

## Scenarios

### DS-01: Open state rendering

**Intent:** Verify the component renders the open state with pulsing indicator and correct status text.

**Spec requirement:** Lines 82-84 (open state rendering), lines 48-49 (DocketStripData interface)

**Steps:**
1. Generate component HTML with `open: true`
2. Load in headless browser with bundled CSS
3. Wait for font loading to stabilize rendering (`document.fonts.ready`)
4. Verify status element has class `docket-strip__status--open`
5. Verify status text contains "UNIT OPEN — STAFF ON SITE"
6. Verify pulse element (`.docket-strip__pulse`) is present in DOM
7. Verify pulse has `aria-hidden="true"` attribute
8. Verify pulse is visually rendered (not `display: none` or `visibility: hidden`)

**Expected outcome:**
- Status text displays "UNIT OPEN — STAFF ON SITE"
- Pulse element exists with proper accessibility attributes
- Pulse is visually present (even though decorative)

**Status:** ✅ PASS

---

### DS-02: Closed state rendering

**Intent:** Verify the component renders the closed state without pulse indicator and with correct status text.

**Spec requirement:** Lines 85-86 (closed state rendering)

**Steps:**
1. Generate component HTML with `open: false`
2. Load in headless browser with bundled CSS
3. Wait for font loading
4. Verify status element has class `docket-strip__status--closed`
5. Verify status text contains "UNIT CLOSED"
6. Verify pulse element (`.docket-strip__pulse`) is NOT present in DOM (count = 0)

**Expected outcome:**
- Status text displays "UNIT CLOSED"
- No pulse element in the DOM
- Correct modifier class applied

**Status:** ✅ PASS

---

### DS-03: Input field rendering

**Intent:** Verify all four input fields (`dktRef`, `dateLabel`, `unitLabel`, and status derived from `open`) appear verbatim in rendered output.

**Spec requirement:** Lines 43-56 (DocketStripData interface), lines 92-109 (HTML output structure)

**Steps:**
1. Generate component HTML with test data:
   - `dktRef: "DKT-2026-W19-123"`
   - `dateLabel: "THU 07.05.2026 / 14:30"`
   - `unitLabel: "UNIT 42 · TEST STREET · CITY"`
   - `open: true`
2. Load in browser and wait for fonts
3. Verify `.docket-strip__ref` contains the DKT reference verbatim
4. Verify `.docket-strip__date` contains the date label verbatim
5. Verify `.docket-strip__unit` contains the unit label verbatim
6. Verify `.docket-strip__status` contains the open-state status text

**Expected outcome:**
- All input values appear exactly as provided (no formatting, no truncation)
- Each value is in its designated element with correct class

**Status:** ✅ PASS

---

### DS-04: Positioning as first visible block

**Intent:** Verify the docket strip appears as the first visible block-level element in the document body per spec intent (line 5: "the first thing on every page").

**Spec requirement:** Line 5 (intent: "the first thing on every page")

**Steps:**
1. Generate page HTML with docket strip followed by other content
2. Load in browser
3. Query all visible block elements in `<body>`
4. Verify the first element has class `docket-strip`

**Expected outcome:**
- Docket strip is the first visible block-level child of `<body>`

**Status:** ✅ PASS

---

### DS-05: HTML injection escaping

**Intent:** Verify all four input fields are properly escaped against HTML injection attacks.

**Spec requirement:** Lines 133-135 (HTML escaping requirement)

**Steps:**
1. Generate component HTML with malicious input:
   - `dktRef: '<script>alert("XSS-dkt")</script>'`
   - `dateLabel: '<img src=x onerror="alert(\'XSS-date\')">'`
   - `unitLabel: '<svg/onload=alert("XSS-unit")>'`
   - `open: false`
2. Load in browser with alert dialog listener
3. Wait 500ms for any malicious scripts to execute
4. Verify malicious strings appear as escaped text, not as HTML
5. Verify no `<script>`, `<img>`, or `<svg>` elements exist within `.docket-strip`
6. Verify no alert dialogs were triggered

**Expected outcome:**
- All malicious input is rendered as escaped text
- No script execution occurs
- No alert dialogs appear
- Content is safe to display

**Status:** ✅ PASS

---

### DS-06: Pulse animation stability

**Intent:** Verify pulse element presence and styling without timing-dependent animation checks, per spec guidance on stability (line 199: "assert presence of the `__pulse` element rather than animation timing").

**Spec requirement:** Lines 159-162 (pulse styling), lines 199 (stability requirement)

**Steps:**
1. Generate component HTML with `open: true`
2. Load in browser and wait for fonts
3. Verify pulse element (`.docket-strip__pulse`) exists (count = 1)
4. Measure bounding box and verify dimensions are approximately 6×6px
5. Get computed `backgroundColor` and verify it's `rgb(58, 138, 74)` (which is `#3a8a4a` in hex)

**Expected outcome:**
- Pulse element is present in DOM
- Dimensions match spec (6×6px ±1px tolerance for rounding)
- Background color is the specified forest green (`#3a8a4a`)
- No timing-based animation checks (stable test)

**Status:** ✅ PASS

---

### DS-07: Responsive layout behavior

**Intent:** Verify the layout responds to viewport width: horizontal row ≥720px, vertical stack <720px.

**Spec requirement:** Lines 178-185 (responsive behavior table), lines 84-94 in CSS (media query)

**Steps:**
1. Generate component HTML with full data
2. Load in browser at desktop viewport (1024×768)
3. Verify `.docket-strip` has `flex-direction: row`
4. Resize viewport to mobile (600×800)
5. Wait for layout to settle (100ms)
6. Verify `.docket-strip` has `flex-direction: column`
7. Verify left side's Y position is less than right side's Y position (left is above right)

**Expected outcome:**
- Desktop (≥720px): sides are horizontal (flex-direction: row)
- Mobile (<720px): sides stack vertically (flex-direction: column)
- In stacked layout, left side appears above right side

**Status:** ✅ PASS

---

### DS-08: Separator character validation

**Intent:** Verify correct use of em-dash (—) within status text and middle-dot (·) between discrete metadata items.

**Spec requirement:** Lines 86-87 (separator characters), lines 69-74 in CSS (separator styling)

**Steps:**
1. Generate component HTML with `open: true`
2. Load in browser and wait for fonts
3. Verify status text contains em-dash: "UNIT OPEN — STAFF ON SITE"
4. Verify exactly 2 separator elements (`.docket-strip__sep`) exist (1 per side)
5. Verify separator text content is middle-dot (·)
6. Verify all separators have `aria-hidden="true"`

**Expected outcome:**
- Em-dash (—) appears in the status text binding the open/staff phrase
- Middle-dots (·) are used between discrete metadata items
- Separators have proper accessibility attributes (aria-hidden)
- Correct semantic distinction between em-dash and middle-dot

**Status:** ✅ PASS

---

## Test Execution

### Run command

```bash
pnpm test sdd/specs/site/components/docket-strip/docket-strip.spec.ts
```

Or using the general test script:

```bash
pnpm test:e2e sdd/specs/site/components/docket-strip/docket-strip.spec.ts
```

### Results summary

**Total scenarios:** 8
**Passed:** 8
**Failed:** 0
**Skipped:** 0

All acceptance criteria from the spec are satisfied.

### Test infrastructure

- **Playwright version:** Pinned to `@playwright/test` compatible with the workflow agent image (Chromium v1217)
- **Browser:** Chromium (headless)
- **CSS loading strategy:** Inlined from bundled `dist/assets/index-*.css` to ensure reliable styling in `page.setContent()` context
- **Font stability:** All tests await `document.fonts.ready` before assertions to prevent flaky rendering checks

### Coverage notes

The test suite covers all explicit acceptance criteria from lines 188-200 of the spec:

- ✅ File byte-identity (verified via `diff` in provenance)
- ✅ CSS import registration (verified via file read in provenance)
- ✅ Build produces dist with docket-strip CSS (verified via `pnpm build` + grep)
- ✅ Open state rendering with pulse (DS-01)
- ✅ Closed state rendering without pulse (DS-02)
- ✅ All four input fields appear verbatim (DS-03)
- ✅ First visible block positioning (DS-04)
- ✅ HTML injection escaping (DS-05)
- ✅ Pulse stability without timing checks (DS-06)

Additionally, the QA pass added scenarios for:

- ✅ Responsive layout behavior (DS-07) — validates spec requirement lines 178-185
- ✅ Separator character correctness (DS-08) — validates spec requirement lines 86-87

## Related Files

- **Spec:** `sdd/specs/site/components/docket-strip/spec.md`
- **Authoritative TypeScript source:** `sdd/specs/site/components/docket-strip/docket-strip.ts`
- **Authoritative CSS source:** `sdd/specs/site/components/docket-strip/docket-strip.css`
- **Application TypeScript (byte-identical copy):** `src/templates/components/docket-strip.ts`
- **Application CSS (byte-identical copy):** `src/styles/components/docket-strip.css`
- **Test suite:** `sdd/specs/site/components/docket-strip/docket-strip.spec.ts`
- **Provenance:** `sdd/specs/site/components/docket-strip/provenance.md`

---

*All scenarios passing. Implementation satisfies spec requirements.*
