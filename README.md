# sdd-reference

A reference implementation of **Spec Driven Development (SDD)**: humans write specs and supporting docs; **workflow agents** (Dockerized CLIs) read them and mutate the repo. The same flow works **locally** (fast feedback) and in **Forgejo Actions** (commit + PR).

## How it works

| Input | Role |
| --- | --- |
| **`sdd/<path>/`** | Per-spec directory: human-authored **`spec.md`** (and siblings such as `copy.yaml`), plus agent-written **`provenance.md`** and **`scenarios.md`**. Nested specs use paths like `sdd/homepage/header/`. |
| **`.skills/`** | Reusable “how to work” guidance (`SKILL.md` per skill). |
| **`context/`** | Product, architecture, design system, deployment, glossary — background for agents. |

**Output:** application and repo files where the spec says to put them (often the repo root). Full rules: [`AGENTS.md`](AGENTS.md).

## Repository map

| Path | Purpose |
| --- | --- |
| `sdd/` | Spec trees (`sdd/<name>/` or nested paths); see [`sdd/README.md`](sdd/README.md) |
| `.skills/` | Agent skills |
| `context/` | Human-maintained background docs |
| `.workflow-agents/` | Dockerfiles and `run-*.sh` entrypoints per agent |
| `.forgejo/workflows/` | CI workflow (manual dispatch) |
| `.scripts/` | `pnpm execute` and local agent runner |
| `.husky/` | Git hooks (lint-staged, etc.) |
| `e2e/` | Playwright tests (often extended by **qa** runs) |

## Supported agents

| Agent | Tool | Env var |
| --- | --- | --- |
| `vibe` | [Mistral Vibe](https://github.com/mistralai/mistral-vibe) | `MISTRAL_API_KEY` |
| `claude` | [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) | `ANTHROPIC_API_KEY` |
| `deepseek` | Claude Code → DeepSeek API | `DEEPSEEK_API_KEY` |

**Choosing an agent:** **`vibe`** is Python-only (no Node in the image). For this Vite repo, use **`claude`** or **`deepseek`** when the spec needs **pnpm**, **Playwright**, or browser QA.

## Install

```bash
corepack enable   # once; picks up pinned pnpm from package.json
pnpm install
```

**Git hooks (optional but recommended):** hooks expect Python tooling on `PATH`:

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
```

Hooks use **ruff**, **pyyaml**, **gitleaks**, etc. See [`AGENTS.md`](AGENTS.md) and [`.husky/`](.husky/).

## Running a spec locally

**Command:**

```bash
pnpm execute spec <agent> <spec-dir> <role>
```

- **`<spec-dir>`** — Repo-relative directory under **`sdd/`** that contains **`spec.md`** (e.g. `sdd/helloworld`, `sdd/homepage`, `sdd/vite-baseline`).
- **`<role>`** — `dev` (implement) or `qa` (verify, scenarios, append provenance). See [Agent roles in AGENTS.md](AGENTS.md#provenance-and-scenarios).

**Requirements:** Docker running; API key exported for the chosen agent. The local runner **refuses `main`** — use a feature/spec branch.

**Examples:**

```bash
# Cheap smoke run (vibe / implementation-friendly)
export MISTRAL_API_KEY="..."
AGENT_DEBUG=true AGENT_MAX_TURNS=20 pnpm execute spec vibe sdd/helloworld dev

# Full dev pass on vite baseline
pnpm execute spec vibe sdd/vite-baseline dev

# QA with Playwright-capable agent (homepage)
export ANTHROPIC_API_KEY="..."
pnpm execute spec claude sdd/homepage qa
```

**Disposable copy** (does not mutate the current checkout):

```bash
pnpm execute spec --tmp claude sdd/vite-baseline dev
```

**Raw provider stream** (no pretty printer):

```bash
AGENT_PRETTY_OUTPUT=false pnpm execute spec claude sdd/vite-baseline dev
```

More detail: [`.scripts/run-agent-local.sh`](.scripts/run-agent-local.sh) (env vars `AGENT_DEBUG`, `AGENT_MAX_TURNS`, `AGENT_OUTPUT_FORMAT`, etc.).

## Running Playwright (e2e)

All tests:

```bash
pnpm test:e2e
```

First-time or after upgrading **`@playwright/test`**:

```bash
pnpm exec playwright install chromium
# or: pnpm exec playwright install
```

Artifacts go to **`test-results/`** (gitignored).

## Typical spec workflow

1. **Branch:** `git switch -c spec/my-feature` (avoid `main` for agent runs).

2. **Add or edit** `sdd/<path>/spec.md` (and siblings the spec references).

3. **Run dev** then **qa** as needed:

   ```bash
   pnpm execute spec claude sdd/my-feature dev
   pnpm execute spec claude sdd/my-feature qa
   ```

4. **Verify:** `pnpm run build`, `pnpm test:e2e`, or whatever the spec lists.

5. **Iterate** on the spec and re-run; prefer changing the spec over silently hand-editing generated output.

6. **Discard uncommitted agent output** (optional):

   ```bash
   git restore .
   git clean -fdn    # dry run — review
   git clean -fd
   ```

7. **Push** your branch and open a normal MR/PR for human review.

### Forgejo workflow (agent → PR)

The workflow [`.forgejo/workflows/workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml) is **manually dispatched**. It does **not** auto-run on every push; you pick **agent**, **`SPEC`** (same form as local, e.g. `sdd/homepage`), **pipeline**, and **role** in the UI.

It builds the agent image, runs against the repo snapshot, commits results to a branch like **`ai/<agent>-<spec-with-slashes-as-dashes>-<run_id>`**, and opens a PR to **`main`**.

**Secrets:** `FORGEJO_PUSH_TOKEN`, `MISTRAL_API_KEY`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`.

## Writing specs

- Path: **`sdd/<path>/spec.md`** (nested paths allowed).
- Structure: **Intent**, **Requirements**, **Acceptance criteria**, **Out of scope** — see [`sdd/helloworld/spec.md`](sdd/helloworld/spec.md).
- Agents must read **sibling files** the spec names (fixtures, `copy.yaml`, etc.).

## Keeping `context/` honest

After tooling or layout changes, update the relevant **`context/*.md`** files so agents do not rely on stale assumptions. Use branch names like **`chore/context-short-topic`** so they are not confused with the **`context/`** directory.

## Scope and learning

Keep each **spec** one coherent, reviewable unit — tight acceptance criteria and clear **out of scope**. Smaller specs mean smaller diffs, cheaper runs, and easier rollback.

SDD is also a way to **practice requirements**: use an LLM to stress-test ambiguity, edge cases, and acceptance tests while **you** own the spec. Juniors still read generated output and iterate on the spec until checks match intent.

## License

[MIT](LICENSE).
