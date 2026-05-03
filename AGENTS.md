# Agents

This repo is a reference implementation of **Spec Driven Development (SDD)**. Specs are written by humans and live under `.sdd/specifications/`. Reusable cross-spec guidance for agents lives under `.skills/` (see [`.skills/README.md`](.skills/README.md)). Agents consume both and generate code — no manual scaffolding required.

## How agents work

Each agent implements a single contract defined in [`.api-agents/base.py`](.api-agents/base.py):

- **Input:** `spec: str` — the raw text of a `spec.md` file
- **Output:** `dict[str, str]` — repo-relative file paths mapped to their contents

The runner ([`.api-agents/run.py`](.api-agents/run.py)) wires everything together: it reads the `AGENT` and `SPEC` environment variables, loads the spec from `.sdd/specifications/<SPEC>/spec.md`, calls `agent.generate(spec)`, and writes the returned files to disk. Each agent independently loads any skills under `.skills/` via [`.api-agents/skills.py`](.api-agents/skills.py) and appends them to its system prompt.

```
.sdd/specifications/<SPEC>/spec.md      .skills/*/SKILL.md
        │                                       │
        ▼                                       ▼
              .api-agents/run.py
                        │
                        ▼
              Agent.generate(spec)
                        │
                        ▼
              Files written to repo root
```

## Available agents

| Agent key   | Class            | Model               | Required env var    |
| ----------- | ---------------- | ------------------- | ------------------- |
| `anthropic` | `AnthropicAgent` | `claude-sonnet-4-5` | `ANTHROPIC_API_KEY` |
| `mistral`   | `MistralAgent`   | `codestral-latest`  | `MISTRAL_API_KEY`   |

The registry is in [`.api-agents/registry.py`](.api-agents/registry.py).

## Containerized agents

Some agents don't fit the `Agent.generate(spec) -> dict` contract because they run as autonomous CLI loops that mutate the workspace in place rather than returning a JSON file map. These live in their own track: a Dockerfile under `.container-agents/<AGENT>/`, a thin entrypoint script, and a shared workflow at [`.forgejo/workflows/container-agents.yml`](.forgejo/workflows/container-agents.yml).

| Agent key | Source                                                      | Tool                                                                              | Required env var    |
| --------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------- |
| `vibe`    | [`.container-agents/vibe/`](.container-agents/vibe/)       | [Mistral Vibe](https://github.com/mistralai/mistral-vibe)                        | `MISTRAL_API_KEY` (Codestral key) |
| `claude`  | [`.container-agents/claude/`](.container-agents/claude/)   | [Anthropic Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) | `ANTHROPIC_API_KEY` |

Each image is built fresh in the workflow and never pushed to a registry, so this flow has no dependency on the Forgejo container registry. The workflow:

1. `docker build`s `.container-agents/<AGENT>/` into an ephemeral local image
2. `docker create`s a container, streams the workspace in via `docker cp` (a tar pipe — bind mounts don't work because the runner is itself in a container talking to the host's docker daemon), runs the agent, then streams the result back out
3. Commits whatever files the agent produced to `ai/<AGENT>-<SPEC>-<run_id>` and opens a PR against `main` — same post-generation pattern as `api-agents.yml`

Both API keys are passed in unconditionally; each agent's entrypoint reads only the one it needs.

### `vibe`

[`.container-agents/vibe/run-vibe.sh`](.container-agents/vibe/run-vibe.sh) reads `SPEC` and `MISTRAL_API_KEY` and runs `vibe -p <prompt> --agent auto-approve --trust --max-turns 50 --max-price 5`. The prompt forbids the agent from touching `.sdd/`, `.api-agents/`, `.container-agents/`, `.forgejo/`, or `.husky/`, and from running any git commands — the workflow owns version control. `--max-turns` and `--max-price` are belt-and-braces caps so a runaway agent can't burn through tokens unbounded; `--trust` lets Vibe honour `AGENTS.md` (otherwise it skips reading it as a prompt-injection precaution).

The active model is pinned in [`.container-agents/vibe/config.toml`](.container-agents/vibe/config.toml) (`active_model = "devstral-2"`), baked into the image at `/root/.vibe/config.toml`. This freezes model selection across Vibe CLI upgrades — bump the alias there if a future Vibe version retires `devstral-2`.

### `claude`

[`.container-agents/claude/run-claude.sh`](.container-agents/claude/run-claude.sh) reads `SPEC` and `ANTHROPIC_API_KEY` and runs `claude -p <prompt> --model claude-sonnet-4-5 --max-turns 50 --output-format text --dangerously-skip-permissions`. Same prompt and constraints as `vibe`. `--dangerously-skip-permissions` is Claude Code's auto-approve equivalent (analogous to Vibe's `--trust` plus `--agent auto-approve`); the alarmist name is by design but the trade-off is acceptable inside an ephemeral container with a constrained prompt and a hard turn cap.

Claude Code has no built-in cost ceiling like Vibe's `--max-price`, so `--max-turns` is the only in-CLI cap. If runaway cost is a concern, set org-level limits in the Anthropic console.

The model is pinned via the `--model` flag rather than a config file because Claude Code's config (`~/.claude/`) is heavier and stateful. To pin a different model, edit the flag in `run-claude.sh`.

## Running locally

```bash
AGENT=anthropic SPEC=helloworld python .api-agents/run.py
```

Both `AGENT` and `SPEC` are required. The runner will exit with a clear error if either is missing or invalid.

## CI (Forgejo)

Two workflows live under [`.forgejo/workflows/`](.forgejo/workflows/), both using Forgejo Actions' `workflow_dispatch.inputs` feature to expose `AGENT` and `SPEC` as dropdown choices in the web UI:

- [`api-agents.yml`](.forgejo/workflows/api-agents.yml) — runs the one-shot Python agents (`anthropic`, `mistral`) via `.api-agents/run.py`
- [`container-agents.yml`](.forgejo/workflows/container-agents.yml) — builds and runs the agentic CLI agents (`vibe`, `claude`) in a fresh container

Both follow the same post-generation pattern: commit the generated files to a new branch `ai/<AGENT>-<SPEC>-<run_id>` and open a pull request against `main` via the Forgejo (Gitea-compatible) API.

Required repo-scoped secrets:

- `FORGEJO_PUSH_TOKEN` — PAT with `write:repository`, used for the branch push and the `pulls` API call
- `ANTHROPIC_API_KEY` — for the `anthropic` agent
- `MISTRAL_API_KEY` — for the `mistral` and `vibe` agents (the same Codestral key works for both)

## Adding a new agent

1. Create `.api-agents/<name>.py` — subclass `Agent`, set the `name` class attribute, implement `generate()`
2. Register it in [`.api-agents/registry.py`](.api-agents/registry.py) under the key you want users to pass as `AGENT`
3. Add that key to the `options` list for `on.workflow_dispatch.inputs.AGENT` in [`.forgejo/workflows/api-agents.yml`](.forgejo/workflows/api-agents.yml)

**System prompt.** `Agent` defines a default `system_prompt` class attribute that instructs the model to return a bare JSON object. Most agents inherit it unchanged. Override it as a class attribute only when a model genuinely needs different phrasing — `AnthropicAgent` is the reference example, adding an explicit boundary instruction because Claude tends to wrap output in prose or fences despite the base instruction:

```python
class AnthropicAgent(Agent):
    name = "anthropic"
    system_prompt = Agent.system_prompt + " Begin your response with { and end with }."
```

## Writing a spec

Specs live at `.sdd/specifications/<name>/spec.md`. Follow the structure used in [`helloworld`](.sdd/specifications/helloworld/spec.md):

- **Intent** — one sentence on what the output should be
- **Requirements** — concrete functional constraints
- **Acceptance criteria** — verifiable checklist (file paths, commands, HTTP checks)
- **Out of scope** — explicit exclusions to keep the agent focused

## Skills

A skill is a reusable bundle of guidance that tells an agent *how* to do a kind of work well, distinct from a spec which tells it *what* to build. Skills live at `.skills/<name>/SKILL.md` and follow the [Anthropic Skills](https://www.anthropic.com/news/skills) convention (YAML frontmatter with `name` + `description`, then a markdown body). See [`.skills/README.md`](.skills/README.md) for the full convention.

Both agent tracks pick up `.skills/` automatically:

- **API agents** — [`.api-agents/skills.py`](.api-agents/skills.py) globs every `.skills/*/SKILL.md`. Each agent's `generate()` calls `load_skills()` and appends the result to its system prompt at call time. Skills go in the system prompt (how to work) rather than the user message (what to build) so they don't dilute the spec.
- **Container agents** — `.container-agents/<agent>/run-*.sh` prompts include an instruction to read every `.skills/<name>/SKILL.md` before generating code. `.skills/` is in the no-modify list alongside `.sdd/`.

To add a skill: create `.skills/<name>/SKILL.md` with valid frontmatter and a body. No further wiring is needed — both agent tracks pick it up on the next run.

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
- Generated files belong at the repo root (or wherever the spec directs)
- Never commit API keys or CI secrets to tracked files
- Keep API-agent implementations in `.api-agents/`, one file per agent
- Keep containerized-agent runtimes in `.container-agents/<agent>/`, one subdirectory per agent
- Do not modify `.api-agents/run.py` or `.api-agents/base.py` to work around a broken agent — fix the agent instead
- Keep git-hook logic in `.husky/` — `package.json` wires up husky and lint-staged, individual checks live as helpers under `.husky/lib/`
