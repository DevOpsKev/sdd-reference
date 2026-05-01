# sdd-reference

Reference implementation for the KRA Spec-Driven Development (SDD) methodology. Specs live under `.sdd/specifications/`; agents in `.agents/` consume a spec and emit code. See [`AGENTS.md`](AGENTS.md) for the architecture and contribution rules.

## Getting started

### Option A: Devcontainer (recommended)

Open the repo in any Dev Containers-aware editor (VS Code, Cursor, JetBrains Gateway, etc.) and reopen in the container. The image installs Python 3.12, Node.js 20 LTS, gitleaks, ruff, and runs `pnpm install` automatically — git hooks are wired up by the time the container is ready.

Required environment variables (forwarded from your host):

- `ANTHROPIC_API_KEY`
- `MISTRAL_API_KEY`
- `OPENAI_API_KEY`

### Option B: Local

Prerequisites:

- **Python ≥ 3.12**
- **Node.js** (any recent version; LTS recommended) for husky + lint-staged
- **[gitleaks](https://github.com/gitleaks/gitleaks)** on `PATH` for secret scanning (`brew install gitleaks` on macOS)

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

## Running an agent

Both `AGENT` and `SPEC` are required:

```bash
AGENT=anthropic SPEC=helloworld python .agents/run.py
```

The runner reads `.sdd/specifications/<SPEC>/spec.md`, calls the chosen agent, and writes the returned files to the repo root. Available agents are listed in [`AGENTS.md`](AGENTS.md#available-agents).

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
