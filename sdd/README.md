# SDD tree (`sdd/`)

Each **spec** is a directory under `sdd/` (for example `sdd/vite-baseline` or nested `sdd/homepage/header`) containing at least **`spec.md`**. Workflow agents also write **`provenance.md`** and **`scenarios.md`** in that same directory per **`AGENT_ROLE`** (see [AGENTS.md](../AGENTS.md#provenance-and-scenarios)).

**Dev** runs create or overwrite **`provenance.md`**; **qa** runs overwrite **`scenarios.md`** and append to **`provenance.md`**. Versioning is via **Git**, not multiple filenames.

See [AGENTS.md](../AGENTS.md) and [`.workflow-agents/base/prompt-postlude.md`](../.workflow-agents/base/prompt-postlude.md) for rules and required content.
