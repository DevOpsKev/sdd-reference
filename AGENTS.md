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

## Running locally

```bash
AGENT=anthropic SPEC=helloworld python .agents/run.py
```

Both `AGENT` and `SPEC` are required. The runner will exit with a clear error if either is missing or invalid.

## CI (Forgejo)

The pipeline is defined in [`.forgejo/workflows/agents.yml`](.forgejo/workflows/agents.yml) using Forgejo Actions' `workflow_dispatch.inputs` feature, which exposes `AGENT` and `SPEC` as dropdown choices when triggering the workflow manually from the web UI.

On a successful run it:

1. Commits the generated files to a new branch `ai/<AGENT>-<SPEC>-<run_id>`
2. Opens a pull request against `main` automatically via the Forgejo (Gitea-compatible) API

It expects three repo-scoped secrets: `FORGEJO_PUSH_TOKEN` (a PAT with `write:repository` and `write:package`, used for the branch push, the `pulls` API call, and pushes to the container registry) plus `ANTHROPIC_API_KEY` and `MISTRAL_API_KEY` for the agents themselves.

## Container images

Two images live under [`containers/`](containers/) and are published to the Forgejo container registry:

| Image                                                                              | Source                                                                | Purpose                                                  |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| `git.kevinryan.io/kevin-ryan-associates-public/sdd-reference/basecontainer:<tag>`  | [`containers/basecontainer/Dockerfile`](containers/basecontainer/Dockerfile) | Lean CI/CD toolchain: Python 3.12, Node 20, gitleaks, ruff, pyyaml. Runs as root. |
| `git.kevinryan.io/kevin-ryan-associates-public/sdd-reference/devcontainer:<tag>`   | [`containers/devcontainer/Dockerfile`](containers/devcontainer/Dockerfile)   | `FROM basecontainer`, adds the non-root `vscode` user with passwordless sudo, zsh, and the [starship](https://starship.rs) prompt. Consumed by [`.devcontainer/devcontainer.json`](.devcontainer/devcontainer.json). |

Both images are published with two tags: `latest` and the seven-character commit sha. Builds happen in [`.forgejo/workflows/containers.yml`](.forgejo/workflows/containers.yml), triggered on push to `main` when anything under `containers/`, the requirements files, or the workflow itself changes (also runnable manually via `workflow_dispatch`). The devcontainer build pins `BASE_IMAGE` to the sha tag of the basecontainer just produced in the same job, so a single workflow run can bootstrap both images from scratch.

amd64 only for now. Multi-arch builds are out of scope.

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

The devcontainer ships with Node 20 LTS, where corepack is still bundled, and runs both steps automatically via `postCreateCommand`. If you're working outside the devcontainer on Node 25+ (corepack is no longer bundled there), install it once with `npm install -g corepack` before the steps above.

External tooling the hooks expect on `PATH`:

- `ruff` — Python lint/format
- `python3` with `pyyaml` — YAML validation
- `gitleaks` — secret scanning (`brew install gitleaks` or download a release)

`ruff` and `pyyaml` are pinned in [`requirements-dev.txt`](requirements-dev.txt); install them with `pip install -r requirements-dev.txt` (the devcontainer does this automatically).

Bypass hooks for a single commit only when truly necessary: `git commit --no-verify`.

## Conventions

These apply to both human contributors and AI coding assistants working in this repo:

- Treat `.sdd/` as read-only — specs are inputs, not outputs
- Generated files belong at the repo root (or wherever the spec directs)
- Never commit API keys or CI secrets to tracked files
- Keep agent implementations in `.agents/`, one file per agent
- Do not modify `.agents/run.py` or `.agents/base.py` to work around a broken agent — fix the agent instead
- Keep git-hook logic in `.husky/` — `package.json` wires up husky and lint-staged, individual checks live as helpers under `.husky/lib/`
