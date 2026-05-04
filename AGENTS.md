# Agents

This repo is a reference implementation of **Spec Driven Development (SDD)**. Specs are written by humans and live under `.sdd/specifications/`. Reusable cross-spec guidance for agents lives under `.skills/` (see [`.skills/README.md`](.skills/README.md)). Project background context lives under `.context/`. Agents consume these inputs and generate code — no manual scaffolding required.

## How agents work

Each agent is a workflow-managed CLI runtime under `.workflow-agents/<AGENT>/`. The shared Forgejo workflow [`.forgejo/workflows/workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml) builds the selected agent image fresh, streams the repository into `/work`, runs the agent against a spec, streams the changed workspace back out, then commits the result to a PR branch.

```
.sdd/specifications/<SPEC>/spec.md      .skills/*/SKILL.md      .context/*.md
        │                                       │                       │
        ▼                                       ▼                       ▼
                      .workflow-agents/<AGENT>/
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
| `vibe`    | [`.workflow-agents/vibe/`](.workflow-agents/vibe/)       | [Mistral Vibe](https://github.com/mistralai/mistral-vibe)                        | `MISTRAL_API_KEY` (Codestral key) |
| `claude`  | [`.workflow-agents/claude/`](.workflow-agents/claude/)   | [Anthropic Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) | `ANTHROPIC_API_KEY` |
| `deepseek` | [`.workflow-agents/deepseek/`](.workflow-agents/deepseek/) | [Claude Code via DeepSeek API](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code) | `DEEPSEEK_API_KEY` |

Each image is built fresh in the workflow and never pushed to a registry, so this flow has no dependency on the Forgejo container registry. The workflow:

1. `docker build`s `.workflow-agents/<AGENT>/` into an ephemeral local image
2. `docker create`s a container, streams the workspace in via `docker cp` (a tar pipe — bind mounts don't work because the runner is itself in a container talking to the host's docker daemon), runs the agent, then streams the result back out
3. Commits whatever files the agent produced to `ai/<AGENT>-<SPEC>-<run_id>` and opens a PR against `main`

All API keys are passed in unconditionally; each agent's entrypoint reads only the one it needs.

### `vibe`

[`.workflow-agents/vibe/run-vibe.sh`](.workflow-agents/vibe/run-vibe.sh) reads `SPEC` and `MISTRAL_API_KEY` and runs `vibe -p <prompt> --agent auto-approve --trust --max-turns 150 --max-price 5`. The prompt forbids the agent from touching `.sdd/`, `.skills/`, `.context/`, `.scripts/`, `.workflow-agents/`, `.forgejo/`, or `.husky/`, and from running any git commands — the workflow owns version control. `--max-turns` and `--max-price` are belt-and-braces caps so a runaway agent can't burn through tokens unbounded; `--trust` lets Vibe honour `AGENTS.md` (otherwise it skips reading it as a prompt-injection precaution).

The active model is pinned in [`.workflow-agents/vibe/config.toml`](.workflow-agents/vibe/config.toml) (`active_model = "devstral-2"`), baked into the image at `/root/.vibe/config.toml`. This freezes model selection across Vibe CLI upgrades — bump the alias there if a future Vibe version retires `devstral-2`.

### `claude`

[`.workflow-agents/claude/run-claude.sh`](.workflow-agents/claude/run-claude.sh) reads `SPEC` and `ANTHROPIC_API_KEY` and runs `claude -p <prompt> --model claude-sonnet-4-5 --max-turns 150 --output-format text --dangerously-skip-permissions`. Same prompt and constraints as `vibe`. `--dangerously-skip-permissions` is Claude Code's auto-approve equivalent (analogous to Vibe's `--trust` plus `--agent auto-approve`); the alarmist name is by design but the trade-off is acceptable inside an ephemeral container with a constrained prompt and a hard turn cap.

Claude Code has no built-in cost ceiling like Vibe's `--max-price`, so `--max-turns` is the only in-CLI cap. If runaway cost is a concern, set org-level limits in the Anthropic console.

The model is pinned via the `--model` flag rather than a config file because Claude Code's config (`~/.claude/`) is heavier and stateful. To pin a different model, edit the flag in `run-claude.sh`.

### `deepseek`

[`.workflow-agents/deepseek/run-deepseek.sh`](.workflow-agents/deepseek/run-deepseek.sh) reads `SPEC` and `DEEPSEEK_API_KEY`, configures Claude Code to use DeepSeek's Anthropic-compatible API (`https://api.deepseek.com/anthropic`), and runs `claude -p <prompt> --model deepseek-v4-flash --max-turns 150 --output-format text --dangerously-skip-permissions`. It uses the same constrained prompt as `claude` and `vibe`.

The primary model is pinned to `deepseek-v4-flash` for lower latency and cost in CI; subagents use the same tier. To switch back to the long-context Pro model, change the `ANTHROPIC_*_MODEL` exports and the `--model` flag in `run-deepseek.sh` to `deepseek-v4-pro[1m]` per DeepSeek's Claude Code integration docs.

## CI (Forgejo)

The pipeline is defined in [`.forgejo/workflows/workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml) using Forgejo Actions' `workflow_dispatch.inputs` feature, which exposes `AGENT` and `SPEC` as dropdown choices in the web UI. On a successful run it commits generated files to `ai/<AGENT>-<SPEC>-<run_id>` and opens a pull request against `main` via the Forgejo (Gitea-compatible) API.

Set the workflow's `DEBUG` input to `true` to pass `AGENT_DEBUG=true` into the container. Debug mode prints safe container diagnostics, runner startup context, and verbose Claude Code streams for Claude Code-based agents without exposing provider API keys.

For local prompt/spec runs, use `pnpm execute spec <agent> <spec>` (which dispatches to [`.scripts/run-agent-local.sh`](.scripts/run-agent-local.sh)). It builds the selected agent image, runs it against the current checkout by default, pretty-prints step-by-step output live, and leaves generated files on the current branch without committing, pushing, or opening a PR. Pass `--tmp` after `spec` to copy the current repo to `.tmp/agent-runs/<AGENT>-<SPEC>-<timestamp>/` for a disposable smoke test. Set `AGENT_MAX_TURNS=20` for cheap early checks and raise it only once the spec/prompt path looks correct.

Required repo-scoped secrets:

- `FORGEJO_PUSH_TOKEN` — PAT with `write:repository`, used for the branch push and the `pulls` API call
- `ANTHROPIC_API_KEY` — for the `claude` agent
- `DEEPSEEK_API_KEY` — for the `deepseek` agent
- `MISTRAL_API_KEY` — for the `vibe` agent (Codestral key)

## Shared workflow-agent base

Cross-agent prompt fragments and shell helpers live at [`.workflow-agents/base/`](.workflow-agents/base/) and are read **at runtime** from the streamed workspace — they are not copied into any agent's container image. Each `run-*.sh` sources `lib/print-toolchain.sh` for its `AGENT_DEBUG=true` toolchain probe and concatenates `prompt-prelude.md` + an agent-specific tool manifest + `prompt-postlude.md` to assemble the prompt it passes to the agent CLI.

This keeps the shared prompt body (spec/skills/context reading rules, hard constraints) in one place while leaving each agent's tool manifest local to that agent — the manifest describes the tools that *that particular container* actually has. Editing the shared fragments does not require rebuilding any image. See [`.workflow-agents/base/README.md`](.workflow-agents/base/README.md) for the full convention.

## Adding a new agent

1. Create `.workflow-agents/<name>/Dockerfile`.
2. Add an executable entrypoint script (for example `run-<name>.sh`) that reads `SPEC` and the provider API key from the environment, loads `.sdd/specifications/<SPEC>/spec.md`, sources `/work/.workflow-agents/base/lib/print-toolchain.sh`, assembles its prompt from the shared `/work/.workflow-agents/base/prompt-{prelude,postlude}.md` fragments plus a container-specific tool manifest, and mutates `/work` in place.
3. Add the key to `on.workflow_dispatch.inputs.AGENT.options` in [`.forgejo/workflows/workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml).

## Writing a spec

Specs live at `.sdd/specifications/<name>/spec.md`. Follow the structure used in [`helloworld`](.sdd/specifications/helloworld/spec.md):

- **Intent** — one sentence on what the output should be
- **Requirements** — concrete functional constraints
- **Acceptance criteria** — verifiable checklist (file paths, commands, HTTP checks)
- **Out of scope** — explicit exclusions to keep the agent focused

Specs may include sibling files such as `copy.yaml`, fixtures, schemas, or examples. When a spec references sibling files, workflow agents must read them before implementing and treat them as part of the spec. For complex specs, prefer putting deterministic copy/data/fixtures in sibling files and require a validation script that proves generated output came from those files rather than from paraphrased agent output.

## Skills

A skill is a reusable bundle of guidance that tells an agent *how* to do a kind of work well, distinct from a spec which tells it *what* to build. Skills live at `.skills/<name>/SKILL.md` and follow the [Anthropic Skills](https://www.anthropic.com/news/skills) convention (YAML frontmatter with `name` + `description`, then a markdown body). See [`.skills/README.md`](.skills/README.md) for the full convention.

Workflow agents pick up `.skills/` automatically: `.workflow-agents/<agent>/run-*.sh` prompts include an instruction to read every `.skills/<name>/SKILL.md` before generating code. `.skills/` is in the no-modify list alongside `.sdd/`, `.context/`, and `.scripts/`.

To add a skill: create `.skills/<name>/SKILL.md` with valid frontmatter and a body. No further wiring is needed — workflow agents pick it up on the next run.

## Context

Project background context lives under `.context/`:

- `.context/product.md` — product goals, users, and assumptions
- `.context/architecture.md` — system boundaries and technical constraints
- `.context/design-system.md` — brand, UI, and content conventions
- `.context/deployment.md` — runtime, hosting, and operational notes
- `.context/glossary.md` — domain terms and naming conventions

Context tells agents background knowledge about this repo/product. It does not replace spec requirements or acceptance criteria, and agents must treat `.context/` as read-only input.

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

## Conventions

These apply to both human contributors and AI coding assistants working in this repo:

- Treat `.sdd/` as read-only — specs are inputs, not outputs
- Treat `.skills/` as read-only — skills are inputs (how to work), not outputs
- Treat `.context/` as read-only — context is background input, not generated output
- Treat `.scripts/` as read-only — local maintainer tooling, not generated output
- Generated files belong at the repo root (or wherever the spec directs)
- Never commit API keys or CI secrets to tracked files
- Keep workflow-agent runtimes in `.workflow-agents/<agent>/`, one subdirectory per agent
- Keep git-hook logic in `.husky/` — `package.json` wires up husky and lint-staged, individual checks live as helpers under `.husky/lib/`
