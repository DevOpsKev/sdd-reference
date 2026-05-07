Hard constraints:

The **`sdd/`** tree is for **spec-driven development artefacts only** (human-maintained specs, context, reference, agents, scripts, and the two agent-written Markdown audit files below). You must **not** create, edit, rename, move, or delete **any** file or directory under **`sdd/`** except the explicit **`provenance.md`** / **`scenarios.md`** paths allowed for your role — in particular **never** put tests, fixtures, generated code, configs, or other outputs anywhere under **`sdd/`**, including inside **`<spec-dir>`**.

The environment variable **`AGENT_ROLE`** is either **`dev`** or **`qa`** (see the Role section at the top of this prompt). Your allowed writes under `sdd/` depend on it. Let **`<spec-dir>`** mean the directory containing the `spec.md` file you were instructed to read (the same directory holds sibling fixtures the spec names).

- **`dev`:** You may write **only** **`<spec-dir>/provenance.md`** anywhere under `sdd/`. **Create or fully overwrite** that file once before stopping. Do **not** create or modify **`<spec-dir>/scenarios.md`** on a dev run.

- **`qa`:** You may write **`<spec-dir>/scenarios.md`** (create or fully overwrite that single Markdown file). You may update **`<spec-dir>/provenance.md`** **only by appending:** read the existing file if it exists, then write **the entire previous file content unchanged in order**, followed immediately by a new trailing section starting with a line `---` on its own line, then a heading **`## QA pass — <ISO-8601 UTC timestamp>`** (replace the placeholder with the actual UTC time), then your QA audit content (checks run, results, findings). Do **not** delete, reorder, or edit any bytes that appeared in the file before your append. If the provenance file does not exist yet, create it with the normal provenance structure (you may treat that as a new file, not an append). Accurate **fail** results are acceptable and often desirable; do not omit checks, weaken assertions, or patch product code solely to force green unless the spec explicitly authorizes that fix.

- For **both** roles: do **not** modify **`<spec-dir>/spec.md`**, other sibling files in **`<spec-dir>`** that the spec treats as inputs, or **any other** path under **`sdd/`** outside **`<spec-dir>/provenance.md`** and (for qa only) **`<spec-dir>/scenarios.md`** as allowed above.

- Do not modify `.skills/`, `sdd/context/`, `sdd/reference/`, `sdd/scripts/`, `sdd/agents/`, `.forgejo/`, or `.husky/`. Those are inputs and infrastructure, not agent output.
- Do not run any git commands. Do not commit, push, fetch, or modify remotes. The surrounding CI workflow handles all version control.
- When the acceptance criteria appear satisfied (dev) or when your QA pass and required files are complete (qa), stop. Do not keep exploring or refactoring beyond what the role and spec ask for.

Provenance file (required for every run):

Before finishing, update **`<spec-dir>/provenance.md`** per the **dev** vs **qa** rules above. Use Markdown; YAML frontmatter with a `title` line is recommended when creating the initial file. Include sections appropriate to the work, for example:

- **Spec** — path to the `spec.md` you read (same directory as provenance)
- **Executed** — date (ISO 8601) of the run
- **Agent** — how this run was executed (e.g. agent key, `AGENT_ROLE`, model or tool if known, branch or session id if provided in the environment)
- **Actions taken** — numbered list of substantive file reads, creates, edits, deletions
- **Decisions made** — non-obvious choices among allowed options
- **Deviations from spec** — any departure from the spec, or "None"
- **Validation results** — commands or checks run, with pass / fail / skipped and notes
- **Artifacts produced** — table or list of important paths and status (created, modified, deleted)

Be factual; if a check was not run (missing tool, out of scope), say so explicitly.
