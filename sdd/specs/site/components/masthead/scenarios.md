---
title: Masthead — QA scenarios
spec: sdd/specs/site/components/masthead
---

# QA scenarios — Masthead

**Command:** `pnpm test:e2e`
**Primary file:** `e2e/home.spec.ts` (also `e2e/base-page.spec.ts` for `.page` child order).

| ID | Intent | Expected | Result |
| -- | ------ | -------- | ------ |
| MH-01 | Structure | `header.masthead` with wordmark, `.stamps-row`, `.masthead-meta` | PASS |
| MH-02 | Wordmark | `.wordmark-stamp` contains **VINYL** and **TRAFFIC** | PASS |
| MH-03 | Stamps | Plain `.stamp`, `.stamp.ink`, `.stamp.red` with spec copy | PASS |
| MH-04 | Tagline | `.masthead-meta .tagline` substrings from `home.ts` | PASS |
| MH-05 | Placement | Second `.page` child after `.docket`, before `nav.tabs` | PASS |
| MH-06 | Composition | `base.ts` calls `masthead()`; `home.ts` passes data only (no `masthead` import) | PASS |

**Last run:** 2026-05-07 — **65** tests passed.
