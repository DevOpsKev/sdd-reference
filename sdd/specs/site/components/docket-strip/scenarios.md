---
title: Docket strip — QA scenarios
spec: sdd/specs/site/components/docket-strip
---

# QA scenarios — Docket strip

**Command:** `pnpm test:e2e`
**Primary file:** `e2e/docket-strip.spec.ts` (preview check); `e2e/home.spec.ts` / `e2e/base-page.spec.ts` for live `/` docket.

| ID | Intent | Expected | Result |
| -- | ------ | -------- | ------ |
| DS-01 | Open vs closed HTML | `open: true` emits `.light` + UNIT OPEN; `open: false` emits UNIT CLOSED, no `.light` | PASS |
| DS-02 | Structure | Root `.docket` with `.left` / `.right` | PASS |
| DS-03 | Escaping | `dktRef`, `dateLabel`, `unitLabel` escaped for HTML | PASS |
| DS-04 | Built CSS | `dist` bundle CSS contains `.docket` rules | PASS |
| DS-05 | Wiring | `src/styles/index.css` imports `docket-strip.css` | PASS |
| DS-06 | Preview | `.page .docket` visible on `/` | PASS |

**Last run:** 2026-05-07 — full suite **65** tests passed.
