# SDD for workflow agents

This document summarizes how **Spec Driven Development (SDD)** works in this repository for **workflow agents** — the Docker-based CLIs under [`sdd/agents/`](agents/) invoked by CI or **`pnpm sdd`**. The steps below assume **`SPEC`** and **`AGENT_ROLE`** in the environment.

**Interactive (IDE) agents** (Cursor, Claude Code in the repo, etc.) use the **same** dev vs qa rules and audit-file behaviour as in the table below; they do not set **`AGENT_ROLE`** — they run **dev** then **qa** as phases or separate turns. For a paste-ready template that mirrors workflow-agent constraints, see **[`prompts/cursor-spec-all.md`](prompts/cursor-spec-all.md)**. Path-agnostic policy lives in **[`AGENTS.md`](../AGENTS.md)** (see also [Execution paths](../AGENTS.md#execution-paths)).

For the full policy text, see **[`AGENTS.md`](../AGENTS.md)** (especially [Provenance and scenarios](../AGENTS.md#provenance-and-scenarios)). Authoritative **prompt** wording for each role inside containers lives under [`sdd/agents/base/`](agents/base/README.md).

## What a spec is

- Each **spec** is a **directory** under **`sdd/specs/`** (for example `sdd/specs/vite-baseline` or nested `sdd/specs/homepage/header`).
- The contract is human-authored **`spec.md`** in that directory, plus any sibling files the spec references (fixtures, copy, schemas, etc.).
- Workflow agents **read** reusable guidance from [`.skills/`](../.skills/README.md), background from [`sdd/context/`](context/), and fixed reference material from [`sdd/reference/`](reference/) when relevant. They **must not** modify those trees (or agent/runner infrastructure).

## End-to-end flow

1. **`SPEC`** is set to the repo-relative path of the spec directory (must contain **`spec.md`**).
2. **`AGENT_ROLE`** is **`dev`**, **`qa`**, or (for orchestration only) you run **`all`** locally / in CI to mean **dev then qa** on the **same** workspace before commit.
3. The agent reads the spec and skills, then mutates the **repo root** (or paths the spec names) for implementation and verification.
4. Audit outputs go **only** into that spec directory, per role (see below). **`sdd/`** is otherwise read-only for workflow agents except those two filenames where allowed.

Local runs: **`pnpm sdd <agent> <spec-dir> <role>`** (see [`AGENTS.md`](../AGENTS.md#ci-forgejo)). CI uses the same roles; **`AGENT_ROLE=all`** runs two container steps (dev, then qa).

## Dev vs qa roles

| | **dev** | **qa** |
| --- | --- | --- |
| **Purpose** | Implement what **`spec.md`** (and siblings) require; stop when acceptance criteria are met. | Verify against the spec; record honest pass/fail; add runnable tests when applicable. |
| **`provenance.md`** | Create or **fully overwrite** once per run. | **Append only** after existing content (read first). If missing, create as usual. |
| **`scenarios.md`** | **Do not** create or modify. | Create or **fully overwrite** with concrete scenarios (see [`prompt-role-qa.md`](agents/base/prompt-role-qa.md)). |
| **Automated tests** | Only if the **spec** requires checks; place them under **`e2e/`** at repo root, never under **`sdd/`**. | **Committed runnable** tests under **`e2e/`** when applicable, plus a **`package.json`** script. Truthful **failing** checks that reflect spec gaps are acceptable. |
| **Prompt framing** | [`prompt-role-dev.md`](agents/base/prompt-role-dev.md) | [`prompt-role-qa.md`](agents/base/prompt-role-qa.md) |

**`all`:** Not a third role inside the container — it means run **dev**, then **qa**, sequentially on one workspace (matches local `pnpm sdd … all` and CI **`AGENT_ROLE=all`**).

## Where work lands

- **Implementation** and app code: repo root (or paths the spec names), not under arbitrary **`sdd/`** paths.
- **Provenance / scenarios:** only in the **active** spec directory (`sdd/specs/<path>/`), as **`provenance.md`** and **`scenarios.md`** only.
- **Tests:** **`e2e/`** at repo root for committed automation; not **`sdd/`**.

Exact “may write / must not write” rules are in [`prompt-postlude.md`](agents/base/prompt-postlude.md) and [`AGENTS.md`](../AGENTS.md#provenance-and-scenarios).

## Related docs

| Doc | Role |
| --- | --- |
| [`AGENTS.md`](../AGENTS.md) | Full agent policy, execution paths (workflow vs IDE), CI, local runner, provenance rules |
| [`sdd/README.md`](README.md) | Map of the **`sdd/`** tree |
| [`sdd/prompts/cursor-spec-all.md`](prompts/cursor-spec-all.md) | Cursor prompt template: **all** (dev then qa) without Docker |
| [`sdd/agents/base/README.md`](agents/base/README.md) | Shared prompt fragments and **`prompt-role-*.md`** |
