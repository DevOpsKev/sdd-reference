---
title: "Docket Strip — QA scenarios"
spec: "sdd/specs/site/components/docket-strip"
---

# QA scenarios — Docket strip

Automated coverage: **`e2e/docket-strip.spec.ts`**.

| ID | Scenario | Result |
| -- | --------- | ------ |
| DS-Q01 | `open: true` renders `UNIT OPEN` and `.light` | PASS |
| DS-Q02 | `open: false` renders `UNIT CLOSED` without `.light` | PASS |
| DS-Q03 | HTML structure `.docket` > `.left` / `.right` | PASS |
| DS-Q04 | `escape()` on `dktRef`, `dateLabel`, `unitLabel` | PASS |

**Command:** `pnpm test:e2e`
**Last run:** 2026-05-07 — suite green (67 passed).
