# Code quality — static checks via pnpm

## Intent

Add **static** code-quality tooling for this repository—TypeScript typechecking and ESLint for JavaScript/TypeScript—so every contributor and **workflow agent** can run the same commands with **`pnpm`**. Outputs must stay compatible with [`sdd/context/architecture.md`](../../context/architecture.md) (plain TypeScript for app code, no CSS frameworks unless a spec adds them, `pnpm` as package manager) and with the **target CI shape** in [`sdd/context/deployment.md`](../../context/deployment.md) (`pnpm lint` / typecheck on the path to full `pnpm check`).

This spec **does not** implement the Vite app, Docker, or product UI. It establishes **lint + typecheck scripts and config** that **later specs** (for example [`vite-baseline`](../vite-baseline/spec.md)) and agents can rely on and extend.

## References

- [`sdd/context/architecture.md`](../../context/architecture.md) — stack boundaries, `pnpm`, TypeScript strictness, plain CSS policy for app code.
- [`sdd/context/deployment.md`](../../context/deployment.md) — CI expectations (`pnpm install --frozen-lockfile`, `pnpm lint`, etc.) once pipelines exist.
- [`AGENTS.md`](../../../AGENTS.md) — agents may not edit `.skills/` or `sdd/context/`; generated repo-root config from this spec is allowed at the repo root per normal SDD output rules.
- Root [`package.json`](../../../package.json) and [`tsconfig.json`](../../../tsconfig.json) — extend, do not replace, existing `packageManager`, `strict` TS, and Vite-oriented `include` unless widening is required for ESLint to type-check config files (document any `tsconfig` change in `provenance.md`).

## Requirements

### Package scripts

Root **`package.json`** must define at least:

| Script        | Command (conceptual) | Purpose |
| ------------- | -------------------- | ------- |
| **`typecheck`** | TypeScript compile with **no emit** across the project surfaces this spec cares about (at minimum everything matched by the root `tsconfig.json` `include`; extend config if ESLint needs typed linting for additional roots). | Fails on type errors before build. |
| **`lint`**    | ESLint over repo TypeScript/JavaScript sources the spec configures (at minimum `src/**/*.ts` and any root `*.ts` such as `vite.config.ts` if present). | Fails on lint violations. |
| **`check`**   | Runs **`typecheck`** then **`lint`** (order fixed: types first). | Single entry for agents and CI. |

Names must be exactly **`typecheck`**, **`lint`**, and **`check`** so documentation and CI can refer to them consistently.

### ESLint

- Use **ESLint 9+ flat config** at the repository root: **`eslint.config.js`** (or `eslint.config.mjs` if ESM extension is required—pick one and document it).
- Enable **TypeScript-aware** rules via **`typescript-eslint`** (parser + `recommendedTypeChecked` or stricter project-aware preset) scoped to TS files; use **`@eslint/js`** `recommended` baseline for JS where applicable.
- **Ignore** `node_modules/`, `dist/`, `coverage/`, `.tmp/`, Playwright output dirs, and any other generated paths so lint is stable and fast.
- Do **not** add rules that require **Tailwind**, **React**, or other stacks **forbidden** by `architecture.md` unless a future spec explicitly introduces them.
- Optional but encouraged: **`eslint-plugin-n`** or similar for Node-facing scripts only if the repo adds root `*.mjs` tooling later—keep the default config focused on **`src/`** and root config files agents touch.

### TypeScript

- **`pnpm typecheck`** must use the repo’s **`tsconfig.json`** (or a dedicated `tsconfig.eslint.json` only if strictly necessary for typed linting; prefer adjusting root `tsconfig` with clear `include`/`exclude` and document in provenance).
- Preserve **`strict`: true** and existing strict flags unless `architecture.md` or a product spec requires otherwise.

### Husky / lint-staged (optional alignment)

- If pre-commit should run the same checks on **staged** files only, extend **`lint-staged`** in `package.json` to invoke ESLint on staged `*.{ts,js}` and keep behaviour consistent with **`pnpm lint`** (document any intentional difference—for example stricter `pnpm lint` on full tree vs faster staged pass).

### Documentation

- Root [`README.md`](../../../README.md) (or a short subsection linked from it): document **`pnpm check`**, **`pnpm lint`**, and **`pnpm typecheck`** for humans and agents.

## Acceptance criteria

- [ ] **`eslint.config.js`** (or **`eslint.config.mjs`**) exists at repo root and is valid for ESLint 9 flat config.
- [ ] Dev dependencies include **`eslint`**, **`typescript-eslint`**, and **`@eslint/js`** (exact versions pinned in `pnpm-lock.yaml`).
- [ ] **`package.json`** defines **`typecheck`**, **`lint`**, and **`check`** scripts as specified under **Package scripts**.
- [ ] **`pnpm install`** succeeds; lockfile updated if dependencies were added.
- [ ] **`pnpm typecheck`** exits **0** on a clean tree after implementation.
- [ ] **`pnpm lint`** exits **0** on a clean tree after implementation.
- [ ] **`pnpm check`** exits **0** (runs both, in order).
- [ ] **`sdd/specs/code-quality/provenance.md`** exists after a **dev** agent run, documenting commands run, config choices, and any deviations from this spec.

## Out of scope

- End-to-end or browser tests (Playwright remains separate; wire-up may be a later spec).
- **Prettier** or full auto-format policy (optional follow-up spec).
- **Stylelint** for CSS (optional follow-up spec once `src/**/*.css` is substantial).
- **Dockerfile**, **nginx**, **Vite** feature work (owned by **`vite-baseline`** or other specs).
- Changing **`sdd/context/`** content (read-only for agents); if architecture text is missing or stale, humans fix context outside this spec’s write permissions.

## Notes

- **Order of delivery:** Implementing this spec **before** **`vite-baseline`** gives agents a **`pnpm check`** gate before UI work lands; if **`vite-baseline`** is already partially implemented, still add scripts so **`pnpm check`** becomes the shared bar.
- Downstream specs should reference **`pnpm check`** (or **`pnpm lint`** + **`pnpm typecheck`**) in acceptance criteria where appropriate.
