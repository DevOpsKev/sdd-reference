---
title: Masthead — QA scenarios
spec: sdd/specs/site/components/masthead
---

# QA scenarios — Masthead

**Command:** `pnpm test:e2e`
**Primary file:** `e2e/home.spec.ts` (also `e2e/base-page.spec.ts` for `.page` child order on preview).

| ID | Intent | Expected | Result |
| -- | ------ | -------- | ------ |
| MH-01 | `masthead()` output structure | `<header class="masthead">` with wordmark, `.stamps-row`, `.masthead-meta` | PASS (via rendered `/` + home e2e) |
| MH-02 | Wordmark | `.wordmark-stamp` contains **VINYL** and **TRAFFIC** | PASS |
| MH-03 | Stamps | Three spans: plain `.stamp`, `.stamp.ink`, `.stamp.red` with expected copy | PASS |
| MH-04 | Tagline | `.masthead-meta .tagline` contains stable substrings from spec copy | PASS |
| MH-05 | Placement | Under `.page`, masthead is direct child after `.docket` and before `<main>` | PASS (`e2e/base-page.spec.ts`) |
| MH-06 | Base isolation | `base.ts` does not import `masthead` | PASS (code review / grep) |

**Last run:** 2026-05-07 — 67 tests passed.
