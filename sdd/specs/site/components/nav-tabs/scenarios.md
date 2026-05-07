---
title: Nav tabs — QA scenarios
spec: sdd/specs/site/components/nav-tabs
---

# QA scenarios — Nav tabs

**Command:** `pnpm test:e2e`
**Primary file:** `e2e/home.spec.ts` (also `e2e/base-page.spec.ts` for four `.page` children).

| ID | Intent | Expected | Result |
| -- | ------ | -------- | ------ |
| NT-01 | Structure | `nav.tabs` with primary links and `.right-tabs` | PASS |
| NT-02 | Active tab | Exactly one `nav.tabs > a.active` (direct child) | PASS |
| NT-03 | Primary copy | **Stockroom**, **Find Us** present | PASS |
| NT-04 | Right utilities | **Search**, **Bag (0)** in `.right-tabs` | PASS |
| NT-05 | Order | `header.masthead` precedes `nav.tabs` under `.page` | PASS |
| NT-06 | Composition | `base.ts` calls `navTabs()`; `home.ts` passes `navTabs` data only | PASS |

**Last run:** 2026-05-07 — **65** tests passed.
