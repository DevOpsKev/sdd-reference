# Agents

This repo is a reference implementation of **Spec Driven Development (SDD)**. Specs are written by humans and live under `.sdd/specifications/`. Agents consume a spec and generate code — no manual scaffolding required.

## How agents work

Each agent implements a single contract defined in [`.agents/base.py`](.agents/base.py):

- **Input:** `spec: str` — the raw text of a `spec.md` file
- **Output:** `dict[str, str]` — repo-relative file paths mapped to their contents

The runner ([`.agents/run.py`](.agents/run.py)) wires everything together: it reads the `AGENT` and `SPEC` environment variables, loads the spec from `.sdd/specifications/<SPEC>/spec.md`, calls `agent.generate(spec)`, and writes the returned files to disk.

```
.sdd/specifications/<SPEC>/spec.md
        │
        ▼
  .agents/run.py
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

The registry is in [`.agents/registry.py`](.agents/registry.py).

## Containerized agents

Some agents don't fit the `Agent.generate(spec) -> dict` contract because they run as autonomous CLI loops that mutate the workspace in place rather than returning a JSON file map. These live in their own track: a Dockerfile under `containers/`, a thin entrypoint script, and a parallel workflow at [`.forgejo/workflows/containerized-agents.yml`](.forgejo/workflows/containerized-agents.yml).

| Agent key | Source                                                                            | Tool         | Required env var  |
| --------- | --------------------------------------------------------------------------------- | ------------ | ----------------- |
| `vibe`    | [`containers/mistral-vibe/`](containers/mistral-vibe/)                            | [Mistral Vibe](https://github.com/mistralai/mistral-vibe) | `MISTRAL_API_KEY` (Codestral key) |

The image is built fresh in the workflow and never pushed to a registry, so this flow has no dependency on the Forgejo container registry. The workflow:

1. `docker build`s `containers/mistral-<AGENT>/`
2. `docker run`s it with the workspace bind-mounted at `/work` and `--user $(id -u):$(id -g)` so generated files are owned by the runner user
3. Commits whatever files the agent produced to `ai/<AGENT>-<SPEC>-<run_id>` and opens a PR against `main` — same post-generation pattern as `agents.yml`

The container's [`run-vibe.sh`](containers/mistral-vibe/run-vibe.sh) entrypoint reads `SPEC` and `MISTRAL_API_KEY` from the environment, locates the spec under `.sdd/specifications/`, and pipes a constrained prompt into `vibe --agent auto-approve --no-tty`. The prompt forbids the agent from touching `.sdd/`, `.agents/`, `.forgejo/`, `.husky/`, or `containers/`, and from running any git commands — the workflow owns version control.

## Running locally

```bash
AGENT=anthropic SPEC=helloworld python .agents/run.py
```

Both `AGENT` and `SPEC` are required. The runner will exit with a clear error if either is missing or invalid.

## CI (Forgejo)

Two workflows live under [`.forgejo/workflows/`](.forgejo/workflows/), both using Forgejo Actions' `workflow_dispatch.inputs` feature to expose `AGENT` and `SPEC` as dropdown choices in the web UI:

- [`agents.yml`](.forgejo/workflows/agents.yml) — runs the one-shot Python agents (`anthropic`, `mistral`) via `.agents/run.py`
- [`containerized-agents.yml`](.forgejo/workflows/containerized-agents.yml) — builds and runs the agentic CLI agents (`vibe`) in a fresh container

Both follow the same post-generation pattern: commit the generated files to a new branch `ai/<AGENT>-<SPEC>-<run_id>` and open a pull request against `main` via the Forgejo (Gitea-compatible) API.

Required repo-scoped secrets:

- `FORGEJO_PUSH_TOKEN` — PAT with `write:repository`, used for the branch push and the `pulls` API call
- `ANTHROPIC_API_KEY` — for the `anthropic` agent
- `MISTRAL_API_KEY` — for the `mistral` and `vibe` agents (the same Codestral key works for both)

## Adding a new agent

1. Create `.agents/<name>.py` — subclass `Agent`, set the `name` class attribute, implement `generate()`
2. Register it in `.agents/registry.py` under the key you want users to pass as `AGENT`
3. Add that key to the `options` list for `on.workflow_dispatch.inputs.AGENT` in [`.forgejo/workflows/agents.yml`](.forgejo/workflows/agents.yml)

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
- Generated files belong at the repo root (or wherever the spec directs)
- Never commit API keys or CI secrets to tracked files
- Keep agent implementations in `.agents/`, one file per agent
- Do not modify `.agents/run.py` or `.agents/base.py` to work around a broken agent — fix the agent instead
- Keep git-hook logic in `.husky/` — `package.json` wires up husky and lint-staged, individual checks live as helpers under `.husky/lib/`
