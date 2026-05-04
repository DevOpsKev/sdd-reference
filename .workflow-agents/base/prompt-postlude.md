Hard constraints:
- Do not modify anything under `.sdd/` except **one** allowed output path: **`.sdd/provenance/<SPEC>/provenance.md`** where `<SPEC>` equals the `SPEC` environment value for this run (same name as `.sdd/specifications/<SPEC>/`). **Create or fully overwrite** that file once before stopping — overwrite replaces prior content; Git retains history. Do not add any other files under `.sdd/` (including under `.sdd/provenance/` besides that single `provenance.md`).
- Do not modify `.skills/`, `.context/`, `.scripts/`, `.workflow-agents/`, `.forgejo/`, or `.husky/`. Those are inputs and infrastructure, not agent output.
- Do not run any git commands. Do not commit, push, fetch, or modify remotes. The surrounding CI workflow handles all version control.
- When the acceptance criteria appear satisfied, stop. Do not keep exploring or refactoring beyond what the spec asks for.

Provenance file (required):

Before finishing, write **`.sdd/provenance/<SPEC>/provenance.md`** with audit data from this run. Use Markdown; YAML frontmatter with a `title` line is recommended. Include sections appropriate to the work, for example:

- **Spec** — path to `.sdd/specifications/<SPEC>/spec.md`
- **Executed** — date (ISO 8601) of the run
- **Agent** — how this run was executed (e.g. agent key, model or tool if known, branch or session id if provided in the environment)
- **Actions taken** — numbered list of substantive file reads, creates, edits, deletions
- **Decisions made** — non-obvious choices among allowed options
- **Deviations from spec** — any departure from the spec, or "None"
- **Validation results** — commands or checks run, with pass / fail / skipped and notes
- **Artifacts produced** — table or list of important paths and status (created, modified, deleted)

Be factual; if a check was not run (missing tool, out of scope), say so explicitly.
