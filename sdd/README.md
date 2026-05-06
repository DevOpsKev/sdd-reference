# SDD tree (`sdd/`)

Each **spec** is a directory under **`sdd/specs/`** (for example `sdd/specs/vite-baseline` or nested `sdd/specs/homepage/header`) containing at least **`spec.md`**. Workflow agents also write **`provenance.md`** and **`scenarios.md`** in that same directory per **`AGENT_ROLE`** (see [AGENTS.md](../AGENTS.md#provenance-and-scenarios)).

## Shared context (`sdd/context/`)

**`sdd/context/`** holds human-maintained **background** Markdown (`product.md`, `architecture.md`, `design-system.md`, etc.). It is **not** a spec: there is no **`spec.md`** inside **`sdd/context/`**, and **`SPEC`** / local runs always point at a **sibling** directory such as `sdd/specs/homepage`. Workflow agents **read** **`sdd/context/*.md`** and must **never** add, edit, or delete files there (same rule as **`.skills/`**). From a spec under **`sdd/specs/<name>/`**, link to context as **`../../context/<file>.md`**.

**Dev** runs create or overwrite **`provenance.md`**; **qa** runs overwrite **`scenarios.md`** and append to **`provenance.md`**. Versioning is via **Git**, not multiple filenames.

## Workflow agents (`sdd/agents/`)

**`sdd/agents/`** holds **Dockerfile + `run-*.sh`** per provider (`vibe`, `claude`, `deepseek`) and the shared **`sdd/agents/base/`** prompt fragments. CI builds **`sdd/agents/<AGENT>/`** as the image context. Workflow agents **read** these files at runtime from `/work/sdd/agents/base/` inside the container; they must **not** edit **`sdd/agents/`** or **`sdd/scripts/`** (see [AGENTS.md](../AGENTS.md)).

## Local scripts (`sdd/scripts/`)

**`sdd/scripts/`** contains **`execute.sh`** (invoked via **`pnpm sdd`** or **`pnpm execute`**) and **`run-agent-local.sh`** (Docker-based local runs). Same read-only rule for workflow agents as **`sdd/agents/`**.

See [AGENTS.md](../AGENTS.md) and [`sdd/agents/base/prompt-postlude.md`](../sdd/agents/base/prompt-postlude.md) for rules and required content.
