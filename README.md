# sdd-reference

Reference implementation for the KRA Spec-Driven Development (SDD) methodology. Specs live under `.sdd/specifications/` and reusable agent guidance lives under `.skills/`; workflow agents in `.workflow-agents/` consume both and emit code. See [`AGENTS.md`](AGENTS.md) for the architecture and contribution rules, and [`.skills/README.md`](.skills/README.md) for the skill convention.

## Getting started

Prerequisites:

- **Python ≥ 3.12**
- **Node.js** (any recent version; LTS recommended) for husky + lint-staged
- **[gitleaks](https://github.com/gitleaks/gitleaks)** on `PATH` for secret scanning (`brew install gitleaks` on macOS)
- **Docker** (only required if you intend to run agents locally; CI builds and runs them in containers)

Then, from the repo root:

```bash
# corepack ships with Node 14.19–24.x; on Node 25+ install it once: npm i -g corepack
corepack enable
pnpm install

# Project virtualenv for Python dev deps (ruff, pyyaml).
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

The git hooks resolve Python through [`.husky/lib/run-python.sh`](.husky/lib/run-python.sh), which prefers `./.venv/bin/python` if it exists — so commits work whether or not the venv is currently activated in your shell. `pnpm install` itself runs husky's `prepare` script, which sets `core.hooksPath` to `.husky/`.

If you'd rather not use a venv (e.g. on macOS with Homebrew Python you'll otherwise hit [PEP 668](https://peps.python.org/pep-0668/)), substitute the last two lines with:

```bash
pip install --user --break-system-packages -r requirements-dev.txt
```

To run an agent you'll also need an API key for whichever provider it talks to:

- `ANTHROPIC_API_KEY` — for the `claude` agent
- `MISTRAL_API_KEY` — for the `vibe` agent (Codestral key)

## Running an agent

Agents are normally run through the Forgejo workflow [`workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml). Trigger it manually with:

- `AGENT` — `vibe` or `claude`
- `SPEC` — a directory under `.sdd/specifications/` such as `helloworld`

The workflow builds the selected agent container, streams the repo into it, lets the agent generate files, then commits the result to `ai/<AGENT>-<SPEC>-<run_id>` and opens a PR against `main`. Available agents are listed in [`AGENTS.md`](AGENTS.md#workflow-agents).

## Git hooks

Pre-commit hooks are managed by [husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged), with helpers under [`.husky/lib/`](.husky/lib/):

| Check | Tool | Scope |
| --- | --- | --- |
| Python lint + format | `ruff check --fix`, `ruff format` | staged `*.py` |
| YAML syntax | PyYAML | staged `*.yml`/`*.yaml` (excluding `.gitlab-ci.yml`) |
| TOML syntax | `tomllib` | staged `*.toml` |
| Trailing whitespace + EOF newline | `.husky/lib/fix-whitespace.py` | all staged text files |
| Large files (> 500 KB) | `.husky/lib/check-large-files.sh` | repo-wide |
| Merge-conflict markers | `git diff --check` | repo-wide |
| Private-key headers | `.husky/lib/check-private-keys.sh` | repo-wide |
| Secret scanning | `gitleaks protect --staged` | repo-wide |

To bypass hooks for a single commit (use sparingly): `git commit --no-verify`.

See [`AGENTS.md`](AGENTS.md) for full project conventions and agent-authoring guidance.

## License

[MIT](LICENSE).
