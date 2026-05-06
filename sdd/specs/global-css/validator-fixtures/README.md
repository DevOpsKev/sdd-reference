# Validator fixtures

Small markdown + CSS pairs used by `pnpm test:validator` to prove the token
validator (`build/validate-tokens.ts`) correctly detects each failure mode
**without mutating the real `tokens.css`** in CI.

## Layout

Each fixture is a directory containing two files:

```
validator-fixtures/
├── README.md                         # this file
├── pass-baseline/
│   ├── design-system.md              # minimal valid design-system fragment
│   └── tokens.css                    # tokens.css that matches it
├── fail-missing-in-css/
│   ├── design-system.md              # declares --paper and --ink
│   └── tokens.css                    # declares --paper only
├── fail-extra-in-css/
│   ├── design-system.md              # declares --paper only
│   └── tokens.css                    # declares --paper and --ink
└── fail-value-mismatch/
    ├── design-system.md              # --paper: #ece6d4
    └── tokens.css                    # --paper: #ffffff
```

Each fixture's `design-system.md` is a *fragment* — it contains at minimum one
Markdown table whose first column header is exactly `Token`, mirroring the
parsing rules the real validator uses. Tables with a different first column
header are present in some fixtures to verify they're correctly ignored
(rules tables, voice-family tables, etc.).

## Driver

`pnpm test:validator` runs a TypeScript driver that, for each fixture
directory:

1. Invokes `build/validate-tokens.ts` with `VALIDATE_TOKENS_MARKDOWN` and
   `VALIDATE_TOKENS_CSS` environment overrides pointing at the fixture's
   `design-system.md` and `tokens.css`.
2. Captures the exit code.
3. Asserts the exit code matches the directory name's prefix:
   - `pass-*` → exit code 0
   - `fail-*` → exit code non-zero

A directory whose name does not start with `pass-` or `fail-` is a driver
error.

## Invariants

- Fixtures are **never** copied to `src/styles/` or anywhere else in the
  application tree. They are read-only inputs to the validator.
- Fixtures are **small** — one or two tokens per file is sufficient to prove
  the validator's logic. Fixtures are not stand-ins for the real token set.
- Adding a new failure mode means adding a new fixture directory plus a one-
  line registration in the driver.
