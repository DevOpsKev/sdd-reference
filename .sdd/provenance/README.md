# Provenance

Each workflow-agent run updates **`<SPEC>/provenance.md`** in this directory (for example `.sdd/provenance/vite-baseline/provenance.md`). **Dev** runs create or overwrite the file; **qa** runs append new sections without removing prior content. Versioning is via **Git**, not multiple filenames. QA also writes **`.sdd/scenarios/<SPEC>/scenarios.md`** (see AGENTS.md).

See [AGENTS.md](../../AGENTS.md#provenance-and-scenarios) and [`.workflow-agents/base/prompt-postlude.md`](../../.workflow-agents/base/prompt-postlude.md) for rules and required content. **Dev** runs overwrite this file; **qa** runs append sections (see AGENTS.md).
