# sdd-reference

A reference implementation of **Spec Driven Development (SDD)**: humans write specs and supporting docs; **workflow agents** (Dockerized CLIs) read them and mutate the repo. The same flow works **locally** (fast feedback) and in **Forgejo Actions** (commit + PR).

## How it works

| Input | Role |
| --- | --- |
| **`sdd/specs/<path>/`** | Per-spec directory: human-authored **`spec.md`** (and siblings such as `copy.yaml`), plus agent-written **`provenance.md`** and **`scenarios.md`**. Nested specs use paths like `sdd/specs/homepage/header/`. |
| **`.skills/`** | Reusable “how to work” guidance (`SKILL.md` per skill). |
| **`sdd/context/`** | Shared product background (architecture, design system, product, deployment, glossary). **Not** a spec directory — there is no `spec.md` here; humans maintain these files; workflow agents **read** them and must **not** edit them. |
| **`sdd/reference/`** | Fixed human references (e.g. vision mockups). **Not** a spec directory, not in the build; agents **read** only and must **not** edit. |
| **`sdd/agents/`** | Workflow-agent Docker images and `run-*.sh` entrypoints, plus shared **`base/`** prompts — infrastructure co-located for templating; agents must **not** edit. |
| **`sdd/scripts/`** | **`pnpm sdd`** (and **`pnpm execute`**) dispatcher plus **`run-agent-local.sh`**; humans maintain; agents must **not** edit. |

**Output:** application and repo files where the spec says to put them (often the repo root). Full rules: [`AGENTS.md`](AGENTS.md).

## Repository map

| Path | Purpose |
| --- | --- |
| `sdd/` | **`sdd/specs/`**, **`sdd/context/`**, **`sdd/reference/`**, **`sdd/agents/`**, **`sdd/scripts/`** — see [`sdd/README.md`](sdd/README.md) |
| `sdd/specs/` | Spec trees (`sdd/specs/<name>/` or nested); each directory with **`spec.md`** is a valid **`SPEC`** target |
| `.skills/` | Agent skills |
| `sdd/context/` | Human-maintained background docs (read-only for agents) |
| `sdd/reference/` | Fixed references and mockups (read-only for agents) |
| `sdd/agents/` | Dockerfiles and `run-*.sh` entrypoints per agent |
| `.forgejo/workflows/` | CI workflow (manual dispatch) |
| `sdd/scripts/` | `pnpm sdd` / `pnpm execute` and local agent runner |
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

## Code quality

Static analysis tooling ensures consistent code quality across contributors and agents:

```bash
pnpm typecheck  # TypeScript type checking (no emit)
pnpm lint       # ESLint (TS/JS)
pnpm check      # Run both (typecheck → lint)
```

These commands run on staged files via lint-staged during pre-commit.

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
pnpm sdd <agent> <spec-dir> <role>
```

(`pnpm execute spec …` is equivalent; see `pnpm sdd --help`.)

- **`<spec-dir>`** — Repo-relative directory under **`sdd/specs/`** that contains **`spec.md`** (e.g. `sdd/specs/vite-baseline`, `sdd/specs/homepage`). Must **not** be **`sdd/context/`**, **`sdd/agents/`**, or **`sdd/scripts/`**.
- **`<role>`** — `dev` (implement), `qa` (verify, scenarios, append provenance), or `all` (dev then qa on the same checkout). See [Agent roles in AGENTS.md](AGENTS.md#provenance-and-scenarios).

**Requirements:** Docker running; API key exported for the chosen agent. The local runner **refuses `main`** — use a feature/spec branch.

**Examples:**

```bash
# Cheap smoke run (vibe / implementation-friendly)
export MISTRAL_API_KEY="..."
AGENT_DEBUG=true AGENT_MAX_TURNS=20 pnpm sdd vibe sdd/specs/vite-baseline dev

# Full dev pass on vite baseline
pnpm sdd vibe sdd/specs/vite-baseline dev

# QA with Playwright-capable agent (homepage)
export ANTHROPIC_API_KEY="..."
pnpm sdd claude sdd/specs/homepage qa

# Dev then QA on the same checkout (matches CI AGENT_ROLE=all)
pnpm sdd claude sdd/specs/homepage all
```

**Disposable copy** (does not mutate the current checkout):

```bash
pnpm sdd --tmp claude sdd/specs/vite-baseline dev
```

**Raw provider stream** (no pretty printer):

```bash
AGENT_PRETTY_OUTPUT=false pnpm sdd claude sdd/specs/vite-baseline dev
```

More detail: [`sdd/scripts/run-agent-local.sh`](sdd/scripts/run-agent-local.sh) (env vars `AGENT_DEBUG`, `AGENT_MAX_TURNS`, `AGENT_OUTPUT_FORMAT`, etc.).

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

2. **Add or edit** `sdd/specs/<path>/spec.md` (and siblings the spec references). When you change **repo-wide** architecture, design rules, or product assumptions, update the matching files under **`sdd/context/`** so agents stay aligned (see **Keeping `sdd/context/` honest** later in this README).

3. **Run dev** then **qa** as needed (or one shot with **`all`**):

   ```bash
   pnpm sdd claude sdd/specs/my-feature all
   # or separately:
   pnpm sdd claude sdd/specs/my-feature dev
   pnpm sdd claude sdd/specs/my-feature qa
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

The workflow [`.forgejo/workflows/workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml) is **manually dispatched**. It does **not** auto-run on every push; you pick **agent** and **`SPEC`** as text (validated: must contain `spec.md`), **debug**, and **`AGENT_ROLE`** (`dev`, `qa`, or **`all`** for dev then qa on the same workspace before commit).

It builds the agent image, runs against the repo snapshot, commits results to a branch like **`ai/<agent>-<spec-with-slashes-as-dashes>-<run_id>`**, and opens a PR to **`main`**.

**Secrets:** `FORGEJO_PUSH_TOKEN`, `MISTRAL_API_KEY`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`.

## Writing specs

- Path: **`sdd/specs/<path>/spec.md`** (nested paths allowed).
- Structure: **Intent**, **Requirements**, **Acceptance criteria**, **Out of scope**.
- Agents must read **sibling files** the spec names (fixtures, `copy.yaml`, etc.).

## Keeping `sdd/context/` and `sdd/reference/` honest

After tooling or layout changes, update the relevant **`sdd/context/*.md`** files so agents do not rely on stale assumptions. When product or visual intent changes in a way that should update the north-star mockup, humans edit **`sdd/reference/`** deliberately (it is not agent output). For git branch names about these docs, prefer a prefix like **`chore/sdd-context-…`** so branch topics are not confused with the **`sdd/context/`** directory.

## Scope and learning

Keep each **spec** one coherent, reviewable unit — tight acceptance criteria and clear **out of scope**. Smaller specs mean smaller diffs, cheaper runs, and easier rollback.

SDD is also a way to **practice requirements**: use an LLM to stress-test ambiguity, edge cases, and acceptance tests while **you** own the spec. Juniors still read generated output and iterate on the spec until checks match intent.

## License

[MIT](LICENSE).
