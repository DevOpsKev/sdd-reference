# Agents

This repo is a reference implementation of **Spec Driven Development (SDD)**. Each spec is a **directory under `sdd/specs/`** (for example `sdd/specs/vite-baseline`, `sdd/specs/homepage`, or nested `sdd/specs/homepage/header`) containing human-authored **`spec.md`** alongside **`provenance.md`** and **`scenarios.md`** (the latter two are agent outputs per role). Reusable cross-spec guidance for agents lives under `.skills/` (see [`.skills/README.md`](.skills/README.md)). Project background context lives under **`sdd/context/`** (not a spec directory — no `spec.md` there). Agents consume these inputs and generate code — no manual scaffolding required. Each workflow-agent run must update audit files in that spec directory per **`AGENT_ROLE`** (see [Provenance and scenarios](#provenance-and-scenarios)): **dev** overwrites provenance; **qa** also writes scenarios and **appends** to provenance.

## How agents work

Each agent is a workflow-managed CLI runtime under `sdd/agents/<AGENT>/`. The shared Forgejo workflow [`.forgejo/workflows/workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml) builds the selected agent image fresh, streams the repository into `/work`, runs the agent against a spec (optionally **dev** then **qa** on the same workspace when `PIPELINE` is `dev-then-qa`), streams the changed workspace back out, then commits the result to a PR branch.

```
sdd/specs/<SPEC>/spec.md (+ siblings)     .skills/*/SKILL.md      sdd/context/*.md
        │                                       │                       │
        ▼                                       ▼                       ▼
                      sdd/agents/<AGENT>/
                                │
                                ▼
                      Agent CLI mutates /work
                                │
                                ▼
                      Files written to repo root
```

## Workflow agents

| Agent key | Source                                                      | Tool                                                                              | Required env var    |
| --------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------- |
| `vibe`    | [`sdd/agents/vibe/`](sdd/agents/vibe/)       | [Mistral Vibe](https://github.com/mistralai/mistral-vibe)                        | `MISTRAL_API_KEY` (Codestral key) |
| `claude`  | [`sdd/agents/claude/`](sdd/agents/claude/)   | [Anthropic Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) | `ANTHROPIC_API_KEY` |
| `deepseek` | [`sdd/agents/deepseek/`](sdd/agents/deepseek/) | [Claude Code via DeepSeek API](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code) | `DEEPSEEK_API_KEY` |

Each image is built fresh in the workflow and never pushed to a registry, so this flow has no dependency on the Forgejo container registry. The workflow:

1. `docker build`s `sdd/agents/<AGENT>/` into an ephemeral local image
2. `docker create`s a container, streams the workspace in via `docker cp` (a tar pipe — bind mounts don't work because the runner is itself in a container talking to the host's docker daemon), runs the agent, then streams the result back out
3. Commits whatever files the agent produced to `ai/<AGENT>-<SPEC_SLUG>-<run_id>` (slashes in `SPEC` become `-` in the branch name) and opens a PR against `main`

All API keys are passed in unconditionally; each agent's entrypoint reads only the one it needs.

### `vibe`

[`sdd/agents/vibe/run-vibe.sh`](sdd/agents/vibe/run-vibe.sh) reads `SPEC`, `AGENT_ROLE` (default `dev` in-container), and `MISTRAL_API_KEY` and runs `vibe -p <prompt> --agent auto-approve --trust --max-turns 150 --max-price 5`. The prompt forbids modifying **`.skills/`**, **`sdd/context/`**, **`sdd/scripts/`**, **`sdd/agents/`**, **`.forgejo/`**, or **`.husky/`**. Under **`sdd/`**, agents may only touch **`provenance.md`** and **`scenarios.md`** in the active spec directory per [Provenance and scenarios](#provenance-and-scenarios) — not **`spec.md`**, sibling inputs, **`sdd/context/`**, or any other spec tree. Agents must not run git commands — the workflow owns version control. This image is **Python-only** (no Node in-container): browser automation against the workspace belongs to **`claude`** / **`deepseek`**, not `vibe`. `--max-turns` and `--max-price` are belt-and-braces caps so a runaway agent can't burn through tokens unbounded; `--trust` lets Vibe honour `AGENTS.md` (otherwise it skips reading it as a prompt-injection precaution).

The active model is pinned in [`sdd/agents/vibe/config.toml`](sdd/agents/vibe/config.toml) (`active_model = "devstral-2"`), baked into the image at `/root/.vibe/config.toml`. This freezes model selection across Vibe CLI upgrades — bump the alias there if a future Vibe version retires `devstral-2`.

### `claude`

[`sdd/agents/claude/run-claude.sh`](sdd/agents/claude/run-claude.sh) reads `SPEC`, `AGENT_ROLE`, and `ANTHROPIC_API_KEY` and runs `claude -p <prompt> --model claude-sonnet-4-5 --max-turns 150 --output-format text --dangerously-skip-permissions`. It shares the same cross-agent prompt fragments as `vibe` but uses this image’s **Node-based** tool manifest. The image includes **Playwright** with headless **Chromium** (see `PLAYWRIGHT_VERSION` in its Dockerfile) for browser-based QA. `--dangerously-skip-permissions` is Claude Code's auto-approve equivalent (analogous to Vibe's `--trust` plus `--agent auto-approve`); the alarmist name is by design but the trade-off is acceptable inside an ephemeral container with a constrained prompt and a hard turn cap.

Claude Code has no built-in cost ceiling like Vibe's `--max-price`, so `--max-turns` is the only in-CLI cap. If runaway cost is a concern, set org-level limits in the Anthropic console.

The model is pinned via the `--model` flag rather than a config file because Claude Code's config (`~/.claude/`) is heavier and stateful. To pin a different model, edit the flag in `run-claude.sh`.

### `deepseek`

[`sdd/agents/deepseek/run-deepseek.sh`](sdd/agents/deepseek/run-deepseek.sh) reads `SPEC`, `AGENT_ROLE`, and `DEEPSEEK_API_KEY`, configures Claude Code to use DeepSeek's Anthropic-compatible API (`https://api.deepseek.com/anthropic`), and runs `claude -p <prompt> --model deepseek-v4-flash --max-turns 150 --output-format text --dangerously-skip-permissions`. It uses the same constrained prompt as `claude` and `vibe`, including Playwright/Chromium in the image (same Dockerfile pattern as `claude`).

The primary model is pinned to `deepseek-v4-flash` for lower latency and cost in CI; subagents use the same tier. To switch back to the long-context Pro model, change the `ANTHROPIC_*_MODEL` exports and the `--model` flag in `run-deepseek.sh` to `deepseek-v4-pro[1m]` per DeepSeek's Claude Code integration docs.

## CI (Forgejo)

The pipeline is defined in [`.forgejo/workflows/workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml) using Forgejo Actions' `workflow_dispatch.inputs` feature, which exposes `AGENT`, `SPEC`, `PIPELINE`, `AGENT_ROLE`, and `DEBUG`. `PIPELINE` may be `agent-only` (one container run using `AGENT_ROLE`) or `dev-then-qa` (runs **dev** then **qa** sequentially on the same workspace before commit). On a successful run it commits generated files to `ai/<AGENT>-<SPEC_SLUG>-<run_id>` and opens a pull request against `main` via the Forgejo (Gitea-compatible) API.

Set the workflow's `DEBUG` input to `true` to pass `AGENT_DEBUG=true` into the container. Debug mode prints safe container diagnostics, runner startup context, and verbose Claude Code streams for Claude Code-based agents without exposing provider API keys.

For local prompt/spec runs, use `pnpm execute spec <agent> <spec-dir> <role>` (which dispatches to [`sdd/scripts/run-agent-local.sh`](sdd/scripts/run-agent-local.sh)). **`<spec-dir>`** is the repo-relative path to the spec directory (must contain **`spec.md`**, be under **`sdd/specs/`**, and must **not** be **`sdd/context/`**, **`sdd/agents/`**, or **`sdd/scripts/`**), for example **`sdd/specs/vite-baseline`** or **`sdd/specs/homepage`**. **`<role>`** is **`dev`** or **`qa`**. It builds the selected agent image, runs it against the current checkout by default, pretty-prints step-by-step output live, and leaves generated files on the current branch without committing, pushing, or opening a PR. Pass `--tmp` after `spec` to copy the current repo to `.tmp/agent-runs/<AGENT>-<SPEC_SLUG>-<role>-<timestamp>/` for a disposable smoke test. Set `AGENT_MAX_TURNS=20` for cheap early checks and raise it only once the spec/prompt path looks correct.

Required repo-scoped secrets:

- `FORGEJO_PUSH_TOKEN` — PAT with `write:repository`, used for the branch push and the `pulls` API call
- `ANTHROPIC_API_KEY` — for the `claude` agent
- `DEEPSEEK_API_KEY` — for the `deepseek` agent
- `MISTRAL_API_KEY` — for the `vibe` agent (Codestral key)

## Shared workflow-agent base

Cross-agent prompt fragments and shell helpers live at [`sdd/agents/base/`](sdd/agents/base/) and are read **at runtime** from the streamed workspace — they are not copied into any agent's container image. Each `run-*.sh` sources `lib/print-toolchain.sh` and `lib/load-agent-role.sh`, injects `prompt-role-<AGENT_ROLE>.md`, and concatenates `prompt-prelude.md` + an agent-specific tool manifest + `prompt-postlude.md` to assemble the prompt it passes to the agent CLI.

This keeps the shared prompt body (spec/skills/context reading rules, hard constraints) in one place while leaving each agent's tool manifest local to that agent — the manifest describes the tools that *that particular container* actually has. Editing the shared fragments does not require rebuilding any image. See [`sdd/agents/base/README.md`](sdd/agents/base/README.md) for the full convention.

## Adding a new agent

1. Create `sdd/agents/<name>/Dockerfile`.
2. Add an executable entrypoint script (for example `run-<name>.sh`) that reads `SPEC` (repo-relative spec **directory** under **`sdd/specs/`**, e.g. `sdd/specs/vite-baseline`), `AGENT_ROLE` (default `dev`), and the provider API key from the environment, sources `/work/sdd/agents/base/lib/spec-paths.sh` and calls `resolve_spec_dir`, loads the resolved `spec.md`, sources `/work/sdd/agents/base/lib/print-toolchain.sh` and `lib/load-agent-role.sh`, assembles its prompt from `prompt-role-${AGENT_ROLE}.md` plus the shared `/work/sdd/agents/base/prompt-{prelude,postlude}.md` fragments plus a container-specific tool manifest, and mutates `/work` in place.
3. Add the key to `on.workflow_dispatch.inputs.AGENT.options` in [`.forgejo/workflows/workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml).

## Writing a spec

Specs live at `sdd/specs/<name>/spec.md` (nested specs use deeper paths, e.g. `sdd/specs/homepage/header/spec.md`). Follow the structure used in [`vite-baseline`](sdd/specs/vite-baseline/spec.md):

- **Intent** — one sentence on what the output should be
- **Requirements** — concrete functional constraints
- **Acceptance criteria** — verifiable checklist (file paths, commands, HTTP checks)
- **Out of scope** — explicit exclusions to keep the agent focused

Specs may include sibling files such as `copy.yaml`, fixtures, schemas, or examples. When a spec references sibling files, workflow agents must read them before implementing and treat them as part of the spec. For complex specs, prefer putting deterministic copy/data/fixtures in sibling files and require a validation script that proves generated output came from those files rather than from paraphrased agent output.

## Skills

A skill is a reusable bundle of guidance that tells an agent *how* to do a kind of work well, distinct from a spec which tells it *what* to build. Skills live at `.skills/<name>/SKILL.md` and follow the [Anthropic Skills](https://www.anthropic.com/news/skills) convention (YAML frontmatter with `name` + `description`, then a markdown body). See [`.skills/README.md`](.skills/README.md) for the full convention.

Workflow agents pick up `.skills/` automatically: `sdd/agents/<agent>/run-*.sh` prompts include an instruction to read every `.skills/<name>/SKILL.md` before generating code. `.skills/` and **`sdd/context/`** are in the no-modify list alongside most of **`sdd/`**, including **`sdd/scripts/`** and **`sdd/agents/`** (see [Provenance and scenarios](#provenance-and-scenarios) for which `sdd/` paths agents may write by role).

To add a skill: create `.skills/<name>/SKILL.md` with valid frontmatter and a body. No further wiring is needed — workflow agents pick it up on the next run.

## Context

Project background context lives under **`sdd/context/`** (alongside spec directories, but **not** a spec — there is no `spec.md` inside **`sdd/context/`**):

- `sdd/context/product.md` — product goals, users, and assumptions
- `sdd/context/architecture.md` — system boundaries and technical constraints
- `sdd/context/design-system.md` — brand, UI, and content conventions
- `sdd/context/deployment.md` — runtime, hosting, and operational notes
- `sdd/context/glossary.md` — domain terms and naming conventions

Context tells agents background knowledge about this repo/product. It does not replace spec requirements or acceptance criteria, and agents must treat **`sdd/context/`** as read-only input.

## Git hooks

Git hooks are managed by [husky](https://typicode.github.io/husky) with [lint-staged](https://github.com/lint-staged/lint-staged), installed via [pnpm](https://pnpm.io). The orchestrator lives at [`.husky/pre-commit`](.husky/pre-commit) and delegates to small helpers under [`.husky/lib/`](.husky/lib/). Per-file linters/formatters (ruff, YAML/TOML validation, whitespace normalisation) are configured under the `lint-staged` key in [`package.json`](package.json).

To enable hooks after cloning:

```bash
corepack enable      # one-time, picks up the pinned pnpm version
pnpm install
```

`pnpm install` runs husky's `prepare` script, which points `core.hooksPath` at `.husky/`. The pinned pnpm version lives in the `packageManager` field of `package.json`; corepack takes care of fetching it.

On Node 20–24 corepack is bundled, so `corepack enable` works out of the box. On Node 25+ corepack is no longer bundled — install it once with `npm install -g corepack` before the steps above.

External tooling the hooks expect on `PATH`:

- `ruff` — Python lint/format
- `python3` with `pyyaml` — YAML validation
- `gitleaks` — secret scanning (`brew install gitleaks` or download a release)

`ruff` and `pyyaml` are pinned in [`requirements-dev.txt`](requirements-dev.txt); install them with `pip install -r requirements-dev.txt`.

Bypass hooks for a single commit only when truly necessary: `git commit --no-verify`.

## Provenance and scenarios

Workflow agents read **`AGENT_ROLE`** from the environment (`dev` or `qa`; local runs pass **`dev`** or **`qa`** as **`<role>`** in `pnpm execute spec <agent> <spec-dir> <role>`).

- **`dev`:** Must create or **fully overwrite** **`provenance.md` in the active spec directory** (the same directory as `spec.md`, i.e. the path in the **`SPEC`** environment variable such as `sdd/specs/vite-baseline`) once per run. Must **not** create or modify **`scenarios.md`** there on a dev run.

- **`qa`:** Must create or **fully overwrite** **`scenarios.md` in that spec directory** with Markdown describing test scenarios (see [`sdd/agents/base/prompt-role-qa.md`](sdd/agents/base/prompt-role-qa.md)). Must add **committed runnable automated tests** at the repo root when applicable (for example `e2e/` + `package.json` script), not only narrative scenarios. Truthful **failing** checks that reflect spec gaps are an acceptable and often desired outcome; do not optimize for green by weakening coverage or hiding failures. Must update **`provenance.md` in that directory** **only by appending** after the existing bytes (read the file first; do not delete or rewrite earlier content). If provenance does not exist yet, create it normally.

**`SPEC`** in CI and local runs is the **repo-relative spec directory** (for example `sdd/specs/vite-baseline` or `sdd/specs/homepage/header`). Version history is **Git**; multiple QA passes append sections over time.

No other paths under `sdd/` may be modified by the agent (specs and sibling inputs remain human-authored unless the spec says otherwise). That includes **`sdd/context/**`**, **`sdd/agents/**`**, and **`sdd/scripts/**`** — shared background and infrastructure only; do not add, edit, or delete files there. Do not add extra files under the active spec directory beyond **`provenance.md`** and **`scenarios.md`** as allowed for the role, and do not modify other **`sdd/specs/**`** spec trees.

See [`sdd/agents/base/prompt-postlude.md`](sdd/agents/base/prompt-postlude.md) for the exact prompt wording.

## Conventions

These apply to both human contributors and AI coding assistants working in this repo:

- **Workflow agents** must not modify anything under `sdd/` except as allowed for the active **`AGENT_ROLE`** (see [Provenance and scenarios](#provenance-and-scenarios)). **Humans** maintain **`sdd/context/`** (shared background), **`sdd/agents/`** and **`sdd/scripts/`** (runner and container definitions), and each spec’s **`spec.md`** and declared sibling inputs under the corresponding **`sdd/specs/<path>/`** directory.
- Treat `.skills/` as read-only — skills are inputs (how to work), not outputs
- Treat **`sdd/context/`** as read-only for workflow agents — background input, not generated output (humans maintain it).
- Treat **`sdd/scripts/`** and **`sdd/agents/`** as read-only for workflow agents — local runner and Docker/prompt infrastructure (humans maintain them). Use one subdirectory under **`sdd/agents/`** per agent key (`vibe`, `claude`, `deepseek`).
- Generated files belong at the repo root (or wherever the spec directs)
- Never commit API keys or CI secrets to tracked files
- Keep git-hook logic in `.husky/` — `package.json` wires up husky and lint-staged, individual checks live as helpers under `.husky/lib/`
