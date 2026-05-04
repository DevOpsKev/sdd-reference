# sdd-reference

A reference implementation of **Spec Driven Development (SDD)** for building software with workflow-managed AI coding agents.

The core idea is simple: humans write specs and reusable guidance; agents read those inputs and generate the implementation. The repository is structured so the same spec can be executed locally during development or in CI/CD to produce a pull request.

## How It Works

SDD separates inputs from generated output:

- `.sdd/specifications/` contains human-authored specs: what should be built.
- `.skills/` contains reusable agent skills: how certain kinds of work should be done.
- `.context/` contains product, architecture, design, deployment, and glossary background.
- `.workflow-agents/` contains Dockerized agent runtimes.
- Generated application files are written at the repo root, or wherever a spec explicitly directs.

In normal use, a developer chooses an agent and a spec. The agent container reads the spec, skills, and context, then mutates the working tree.

## Repository Map

| Path | Purpose |
| --- | --- |
| `.sdd/specifications/` | SDD specs such as `helloworld` and `vite-baseline` |
| `.skills/` | Reusable guidance consumed by agents |
| `.context/` | Product and technical background for generated work |
| `.workflow-agents/` | Docker images and entrypoints for each supported agent |
| `.forgejo/workflows/` | CI/CD workflow that runs agents and opens PRs |
| `.scripts/` | Local maintainer tooling |
| `.husky/` | Git hook orchestration and helper checks |

For deeper agent architecture and contribution rules, see [`AGENTS.md`](AGENTS.md).

## Supported Agents

| Agent | Provider/tool | Required local env var |
| --- | --- | --- |
| `vibe` | Mistral Vibe | `MISTRAL_API_KEY` |
| `claude` | Anthropic Claude Code | `ANTHROPIC_API_KEY` |
| `deepseek` | Claude Code via DeepSeek API | `DEEPSEEK_API_KEY` |

## Developer Workflow

The normal SDD loop starts with the spec, not the implementation.

1. Create a spec branch.

```bash
git switch -c spec/<spec-name>
```

2. Write the spec on that branch.

Interactive problem solving with an LLM is encouraged here. The human owns the intent, constraints, and acceptance criteria; the LLM can help structure the spec, identify missing checks, and tighten ambiguous requirements.

3. Add the spec under:

```text
.sdd/specifications/<spec-name>/spec.md
```

4. Execute the spec locally.

```bash
AGENT_DEBUG=true AGENT_MAX_TURNS=20 pnpm execute spec <agent> <spec-name>
```

5. Test the generated result locally.

For a Dockerized site, for example:

```bash
docker build -t <spec-name> .
docker run --rm -p 8080:80 <spec-name>
```

6. Iterate on the spec.

If the generated output is wrong, update the spec and rerun the agent. Avoid hand-fixing generated files as the primary path; the goal is for the spec to reliably reproduce the desired solution.

7. Push the working branch upstream.

```bash
git push -u origin spec/<spec-name>
```

8. Let CI/CD execute the spec.

The workflow runs the selected agent against the branch, performs the configured checks, and validates the generated result.

9. Review the PR raised by CI/CD.

The PR should contain the generated implementation produced from the spec branch. The spec remains the source of truth; local runs are the feedback loop, and CI/CD is the repeatable execution path.

10. Abandon bad experiments cheaply.

If the idea turns out to be wrong, delete the spec branch instead of carrying a half-integrated implementation forward. Because the spec and generated output live off `main`, the cleanup is just normal branch cleanup:

```bash
git switch main
git branch -D spec/<spec-name>
git push origin --delete spec/<spec-name> # only if the branch was pushed
```

`main` stays clean, and the failed idea leaves no architectural scar tissue.

## Limited Blast Radius

Keep specs tightly scoped.

A spec should describe one coherent change with clear boundaries and acceptance criteria. Broad specs burn tokens, cost money, and produce large generated diffs that are hard to review.

Large, unfocused specs create two problems:

- Human reviewers hit cognitive overload. They have to understand too many decisions, files, and trade-offs at once.
- AI reviewers hit context overload. The review becomes a token-heavy context explosion, increasing cost while reducing review quality.

Prefer several small specs over one sprawling spec. Each spec should be small enough that:

- The intent is obvious.
- The generated diff is reviewable.
- Acceptance criteria are concrete.
- Failures can be traced back to a specific requirement.
- The branch can be abandoned cheaply if the idea is wrong.

Small specs are not just cheaper. They are safer, easier to learn from, and easier to trust.

## Learning With Specs

SDD is also a structured learning workflow for junior engineers.

Rather than using an LLM as a code vending machine, junior engineers should use it as a tutor and reviewer while writing specs. The goal is to learn how to express intent, constraints, risks, and acceptance criteria clearly enough that an agent can execute the work repeatably.

> The fastest way to learn is often to argue with a very patient machine about requirements, edge cases, trade-offs, and why its first answer is wrong. That loop forces clarity. It’s just engineering practice with a tireless rubber duck that occasionally writes code.

Useful questions to ask the LLM while writing or refining a spec:

- What is ambiguous in this requirement?
- What edge cases am I missing?
- What acceptance criteria would prove this works?
- What should be explicitly out of scope?
- What files, systems, or boundaries should this probably touch?
- What failure modes should I test?
- Does this spec conflict with existing architecture, product, or design guidance?
- How could another agent misinterpret this instruction?
- Explain why the generated output does or does not satisfy the spec.

This makes the LLM a patient teacher rather than a shortcut around learning. Junior engineers still inspect the generated result, understand failures, and iterate on the spec until the acceptance criteria are meaningful. Senior engineers then get a better coaching surface: they can review the spec and generated output together instead of reviewing unexplained ad hoc AI-generated code.

## Local Usage

Install the lightweight project tooling once:

```bash
corepack enable
pnpm install
```

To run agents locally, Docker must be running and the provider API key for the selected agent must be set.

Run a spec against your current branch:

```bash
export MISTRAL_API_KEY="..."
AGENT_DEBUG=true AGENT_MAX_TURNS=20 pnpm execute spec vibe vite-baseline
```

Local runs:

- Build the selected image from `.workflow-agents/<agent>/`.
- Mount the current checkout into the container.
- Stream readable step-by-step output to the terminal.
- Leave generated files directly in the current branch.
- Refuse to run on `main` as a safety catch.

Use a low turn cap first to catch prompt or spec mistakes cheaply. If the run starts correctly, use the normal cap:

```bash
AGENT_DEBUG=true AGENT_MAX_TURNS=150 pnpm execute spec vibe vite-baseline
```

For a disposable smoke test that does not mutate your checkout, pass `--tmp`:

```bash
AGENT_DEBUG=true AGENT_MAX_TURNS=20 pnpm execute spec --tmp vibe vite-baseline
```

To see the raw provider stream instead of the pretty terminal output:

```bash
AGENT_PRETTY_OUTPUT=false pnpm execute spec vibe vite-baseline
```

## CI/CD Usage

CI runs through Forgejo Actions in [`.forgejo/workflows/workflow-agents.yml`](.forgejo/workflows/workflow-agents.yml).

Trigger the workflow manually with:

- `AGENT`: `vibe`, `claude`, or `deepseek`
- `SPEC`: a spec directory under `.sdd/specifications/`
- `DEBUG`: `true` for verbose diagnostics

The workflow builds the selected agent image, copies the repository into the container, runs the agent against the spec, commits the generated files to an `ai/<AGENT>-<SPEC>-<run_id>` branch, and opens a pull request against `main`.

Required repo secrets:

- `FORGEJO_PUSH_TOKEN`
- `MISTRAL_API_KEY`
- `ANTHROPIC_API_KEY`
- `DEEPSEEK_API_KEY`

## Writing Specs

Specs live at `.sdd/specifications/<name>/spec.md`.

A good spec should include:

- Intent: one sentence describing the desired output.
- Requirements: concrete behavior and file layout.
- Acceptance criteria: commands or checks that prove completion.
- Out of scope: explicit boundaries to keep the agent focused.

Specs may reference sibling files such as copy, fixtures, schemas, or examples. If they do, agents are expected to read those files and treat them as part of the spec.

## Developer Setup

For hook and lint support, install the Python dev dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

The pre-commit hooks are managed by Husky and lint-staged. They check Python formatting, YAML/TOML syntax, whitespace, large files, merge conflict markers, private-key headers, and secrets.

External tools expected by the hooks:

- `gitleaks`
- `python3`
- `ruff`
- `pyyaml`

See [`AGENTS.md`](AGENTS.md) for the full conventions, protected paths, and agent implementation details.

## License

[MIT](LICENSE).
