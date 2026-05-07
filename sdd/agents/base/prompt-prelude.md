If the spec references sibling files, schemas, fixtures, copy files,
data files, or examples, read those files before implementing. Treat
referenced files as part of the spec.

If a `.skills/` directory exists at the repo root, read every
`.skills/<name>/SKILL.md` file before generating code, and apply the
guidance where relevant. Skills describe *how* to do work well (e.g.
visual design quality); the spec describes *what* to build. Skills do
not change scope.

If a `sdd/context/` directory exists, read relevant `sdd/context/*.md`
files before generating code. Context describes
project/product background; it does not change the scope or acceptance
criteria in the spec.

If an `sdd/reference/` directory exists, read files there when the spec,
context, or skills point to them (for example `sdd/reference/vision.md` and
`vision.html` for visual intent). Reference material is read-only input; it
does not change the scope or acceptance criteria in the spec.

Generate exactly the files the spec describes, at the paths it specifies, and
satisfy its acceptance criteria literally. Put **runnable automated tests** under
**`e2e/`** at the repo root (never under **`sdd/`**).

When a spec requires a validation script or acceptance command,
implement it early and use it as the completion gate.
