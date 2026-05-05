# Shared workflow-agent base

Cross-agent prompt fragments and shell helpers used by every agent
under `.workflow-agents/<name>/`. Files here are **read at runtime**
from the streamed workspace (`/work/.workflow-agents/base/`); they are
not copied into any agent's container image, so prompt edits do not
require a rebuild.

## Contents

| Path | Used by | Purpose |
| --- | --- | --- |
| `prompt-prelude.md` | every `run-*.sh` | Shared opening of the agent prompt: spec/skills/context reading rules, "generate exactly", validation-first guidance. |
| `prompt-postlude.md` | every `run-*.sh` | Hard constraints, no-modify list (with `sdd/` exceptions by `AGENT_ROLE`), required provenance/scenarios behaviour, no-git, stop-when-done. |
| `prompt-role-dev.md` | every `run-*.sh` | Framing for `AGENT_ROLE=dev` (implementation). |
| `prompt-role-qa.md` | every `run-*.sh` | Framing for `AGENT_ROLE=qa` (verification, committed runnable tests, scenarios file, append-only provenance). |
| `lib/spec-paths.sh` | every `run-*.sh` | `resolve_spec_dir` — normalizes **`SPEC`** (repo-relative spec directory under `sdd/`) and exports `SPEC_PATH`, provenance/scenarios paths, `SPEC_SLUG`. |
| `lib/print-toolchain.sh` | every `run-*.sh` debug block | Sourced bash library that defines `print_toolchain <tool>...`, printing each requested binary's presence and version. |
| `lib/load-agent-role.sh` | every `run-*.sh` | Validates `AGENT_ROLE` (`dev` or `qa`, default `dev`) and checks the matching `prompt-role-*.md` exists. |

The agent-specific tool manifest (which tools are available *in this
particular container*) and any agent-specific framing stay inside each
agent's own `run-*.sh`, sandwiched between the shared prelude and
postlude (with the role block injected before the prelude).

## Why runtime read, not image bake

Three reasons:

1. The Forgejo workflow streams the full repo into `/work` before the
   container's entrypoint runs, so these files are guaranteed to be
   present at runtime regardless of which agent is selected. No docker
   build orchestration needs to know about this directory.
2. Each agent's `Dockerfile` build context stays scoped to its own
   directory (`.workflow-agents/<name>/`). Adding a `COPY` from a
   sibling directory would force the build context up one level and
   require `-f path/to/Dockerfile` in two places (the local runner and
   the Forgejo workflow).
3. Iterating on the shared prompt does not require rebuilding any
   image. This is the same property the spec itself has — both inputs
   are repo-resident, picked up by the agent on the next run.

## Constraints

- `.workflow-agents/` is in the agent no-modify list (see `AGENTS.md`).
  Agents may **read** from `.workflow-agents/base/` at runtime — that
  is what `run-*.sh` does — but must not generate or edit files under
  this directory.
- The shell library targets bash 5+ (every agent base image ships
  bash). It does not aim for POSIX `sh` portability.
- Agents may **write** only the `sdd/` paths allowed for the active
  **`AGENT_ROLE`** (see `prompt-postlude.md` and `AGENTS.md`).
- Static files under `base/` must not embed secrets. **`AGENT_ROLE`**
  is chosen by the runner (`run-*.sh` reads the environment); role
  bodies live in separate `prompt-role-*.md` files.
