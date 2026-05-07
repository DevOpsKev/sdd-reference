---
title: Nav tabs — QA scenarios
spec: sdd/specs/site/components/nav-tabs
---

# QA scenarios — Nav tabs

**Command:** `pnpm test:e2e`
**Primary file:** `e2e/home.spec.ts` (also `e2e/base-page.spec.ts` for `.page` direct child order on preview).

| ID | Intent | Expected | Result |
| -- | ------ | -------- | ------ |
| NT-01 | `navTabs()` on `/` | `nav.tabs` visible with primary links and `.right-tabs` | PASS |
| NT-02 | Active primary tab | Exactly one direct child `a.active` under `nav.tabs` | PASS |
| NT-03 | Primary copy | Labels include **Stockroom** and **Find Us** | PASS |
| NT-04 | Right utilities | `.right-tabs` contains **Search** (↗) and **Bag (0)** | PASS |
| NT-05 | Placement | Under `.page`, order is docket → masthead → `nav.tabs` → `main` | PASS |
| NT-06 | Base isolation | `base.ts` does not import `navTabs` | PASS (grep) |

**Last run:** 2026-05-07 — 68 tests passed.
