# Provenance

Each workflow-agent run against a spec writes **`<SPEC>/provenance.md`** in this directory (for example `.sdd/provenance/vite-baseline/provenance.md`). The agent **overwrites** that file each time; versioning is via **Git**, not multiple filenames.

See [AGENTS.md](../../AGENTS.md#provenance) and [`.workflow-agents/base/prompt-postlude.md`](../../.workflow-agents/base/prompt-postlude.md) for rules and required content.
