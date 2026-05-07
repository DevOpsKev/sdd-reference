# Cursor — run a spec as ALL (dev then qa)

Paste into Cursor chat. Replace **`SPEC_DIR`** below with the repo-relative spec directory containing `spec.md` (for example `sdd/specs/site/pages/home`).

---

## SPEC

**`SPEC_DIR`** → replace with your path, e.g. `sdd/specs/site/components/docket-strip`

Treat **`SPEC_DIR`** as **`<spec-dir>`** everywhere below.

## AGENT_ROLE

**ALL** — Execute **dev** first, then **qa**, on the **same workspace**, before you finish. Do not stop after dev alone.

---

### Reading (workflow agent prelude)

- If `spec.md` references sibling files under `<spec-dir>`, read them before implementing; they are part of the spec.
- If `.skills/` exists at the repo root, read every `.skills/<name>/SKILL.md` before writing code; skills guide *how*, not scope.
- Only read `sdd/context/` or `sdd/reference/` when **this spec** tells you to (otherwise skip).

Generate exactly what `spec.md` requires at the paths it names. Satisfy acceptance criteria literally. Put runnable automated tests under **`e2e/`** at the repo root only (never under **`sdd/`**). Use spec-required commands (`pnpm build`, `pnpm test:e2e`, etc.) as completion gates where applicable.

---

### Phase 1 — dev

You are the **implementation** agent.

- `spec.md` and referenced siblings in `<spec-dir>` are the contract.
- Do not expand scope. When implementation acceptance criteria are satisfied, end this phase.
- Under **`sdd/`**, you may write **only** **`<spec-dir>/provenance.md`**: create or **fully overwrite** it once. Do **not** create or modify **`<spec-dir>/scenarios.md`** in this phase.
- Do **not** modify **`spec.md`** or other inputs in `<spec-dir>` unless the spec explicitly allows it.
- Do **not** modify `.skills/`, `sdd/context/`, `sdd/reference/`, `sdd/scripts/`, `sdd/agents/`, `.forgejo/`, `.husky/`, or any other path under **`sdd/`** outside **`<spec-dir>/provenance.md`**.
- Do **not** run git.

---

### Phase 2 — qa

You are the **QA / verification** agent.

- Use the spec and acceptance criteria as the **test oracle**. Run build/tests when tools allow; record pass / fail / skipped honestly. Truthful reds are acceptable.
- Do **not** game verification (no weakening coverage to force green).
- **Runnable automated tests (required):** add or update tests under **`e2e/`** only; use **`@playwright/test`** unless the spec says otherwise; run **`pnpm test:e2e`** (or the spec’s script) before finishing and record results.
- **Scenarios (required):** create or **fully overwrite** **`<spec-dir>/scenarios.md`** with concrete scenarios (ids, steps, expected vs actual, links to acceptance bullets); reference **`e2e/`** paths and the **`pnpm`** script used.
- **Provenance:** update **`<spec-dir>/provenance.md`** **only by appending**: read the file first; keep every prior byte unchanged in order; append a new section beginning with a line `---` alone, then **`## QA pass — <ISO-8601 UTC>`**, then your QA audit. If provenance did not exist, create it normally (not an append).
- Under **`sdd/`**, do not touch anything except **`<spec-dir>/scenarios.md`** (overwrite) and **`<spec-dir>/provenance.md`** (append as above).
- Do **not** run git.

---

### Hard constraints (both phases)

Do **not** place tests, generated code, or configs under **`sdd/`** except **`provenance.md`** / **`scenarios.md`** in `<spec-dir>` as allowed above.

Stop when dev acceptance is met and qa obligations (tests, `scenarios.md`, provenance append, honest validation notes) are complete—no extra refactors.

---

### Before you start

Read **`SPEC_DIR/spec.md`** (after substituting the real path).
