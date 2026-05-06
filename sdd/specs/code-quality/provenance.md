---
title: Code Quality Implementation Provenance
---

# Provenance: Code Quality Tooling

## Spec

`sdd/specs/code-quality/spec.md`

## Executed

2026-05-06T00:00:00Z (ISO 8601)

## Agent

- **Agent**: Claude (claude-sonnet-4-5)
- **Role**: dev
- **Mode**: workflow agent container

## Actions taken

1. Read `sdd/specs/code-quality/spec.md` and referenced context files
2. Read `.skills/frontend-design/SKILL.md` to understand project conventions
3. Read existing `package.json` and `tsconfig.json` to understand current configuration
4. Updated `package.json`:
   - Added `typecheck`, `lint`, and `check` scripts
   - Added ESLint dependencies: `@eslint/js@^9.20.0`, `eslint@^9.20.0`, `typescript-eslint@^8.21.0`
   - Extended `lint-staged` to run `eslint --fix` on `*.{ts,js,mjs,cjs}` files
5. Created `eslint.config.mjs` (ESLint 9 flat config) with:
   - TypeScript-aware rules via `typescript-eslint` scoped to `**/*.ts` and `**/*.tsx` files
   - `@eslint/js` recommended baseline for all files
   - Ignore patterns: `node_modules/`, `dist/`, `coverage/`, `.tmp/`, `test-results/`, `playwright-report/`, `playwright/.cache/`, `sdd/`, `.husky/`, `.forgejo/`
6. Created `src/` directory and minimal placeholder `src/main.ts` to satisfy TypeScript's requirement for at least one input file
7. Ran `pnpm install --no-frozen-lockfile` to install new dependencies and update lockfile
8. Validated all commands: `pnpm typecheck`, `pnpm lint`, and `pnpm check` all exit 0
9. Updated `README.md` with "Code quality" section documenting the new commands
10. Created this provenance file

## Decisions made

1. **ESLint config filename**: Chose `eslint.config.mjs` over `eslint.config.js` because the configuration uses ES module syntax (`import`/`export`), and using the `.mjs` extension makes this explicit without requiring `"type": "module"` in `package.json`.

2. **TypeScript-aware rules scoping**: Applied `recommendedTypeChecked` only to `**/*.ts` and `**/*.tsx` files rather than all files. This prevents ESLint from attempting to apply TypeScript project-aware rules to JavaScript files in infrastructure directories like `sdd/scripts/`.

3. **Infrastructure directories in ignore list**: Added `sdd/`, `.husky/`, and `.forgejo/` to ESLint ignores. These directories contain workflow infrastructure and git hooks that agents should not modify (per `AGENTS.md`), and linting them is not useful for code quality goals.

4. **Placeholder source file**: Created minimal `src/main.ts` with `export {}` statement to satisfy TypeScript compiler's requirement for at least one input file. The `tsconfig.json` includes `["src"]` but the vite-baseline spec hasn't been implemented yet. This placeholder allows `pnpm typecheck` to succeed while establishing the directory structure for future specs.

5. **Dependency versions**: Let pnpm resolve latest compatible versions within the `^` range specified (ESLint 9.20+, typescript-eslint 8.21+). Exact versions are pinned in `pnpm-lock.yaml`.

## Deviations from spec

**Minor deviation**: Created `src/main.ts` placeholder file to satisfy TypeScript's requirement for at least one input file. The spec says "This spec **does not** implement the Vite app" but doesn't explicitly forbid creating the directory structure. Without at least one `.ts` file in `src/`, the acceptance criterion "`pnpm typecheck` exits **0**" cannot be met because TypeScript exits with error TS18003 when no inputs are found.

**Rationale**: The placeholder is minimal (3 lines, empty export) and establishes the expected directory structure for the vite-baseline spec. The alternative would be modifying `tsconfig.json` to include additional paths or adding flags to the typecheck script, which would deviate further from standard Vite project conventions.

## Validation results

| Command | Status | Notes |
|---------|--------|-------|
| `pnpm install --no-frozen-lockfile` | ✅ Pass | Installed 150 new packages; lockfile updated |
| `pnpm typecheck` | ✅ Pass | No TypeScript errors; checked `src/main.ts` |
| `pnpm lint` | ✅ Pass | No ESLint violations; linted root and `src/` |
| `pnpm check` | ✅ Pass | Both typecheck and lint passed in sequence |

## Artifacts produced

| Path | Status | Description |
|------|--------|-------------|
| `eslint.config.mjs` | Created | ESLint 9 flat config with TypeScript support |
| `package.json` | Modified | Added scripts (`typecheck`, `lint`, `check`) and dependencies |
| `pnpm-lock.yaml` | Modified | Lockfile updated with ESLint packages |
| `node_modules/` | Modified | New dependencies installed |
| `src/main.ts` | Created | Minimal placeholder for TypeScript input |
| `README.md` | Modified | Added "Code quality" section |
| `sdd/specs/code-quality/provenance.md` | Created | This file |

## Configuration details

**ESLint configuration** (`eslint.config.mjs`):
- Parser: `typescript-eslint` for TypeScript files
- Rules: `@eslint/js` recommended + `typescript-eslint` recommendedTypeChecked
- Ignores: build outputs, test artifacts, infrastructure directories
- TypeScript project service enabled with `tsconfigRootDir` set to repo root

**TypeScript configuration** (no changes):
- Preserved `strict: true` and all existing strict flags
- Used existing `tsconfig.json` without modification (except for adding files to satisfy include paths)
- No separate `tsconfig.eslint.json` needed

**Package scripts**:
```json
"typecheck": "tsc --noEmit",
"lint": "eslint .",
"check": "pnpm typecheck && pnpm lint"
```

**lint-staged** (extended):
- `*.{ts,js,mjs,cjs}`: `eslint --fix` (runs on staged files during pre-commit)
- Existing Python, YAML, TOML checks preserved

---

## QA pass — 2026-05-06T10:45:18Z

### Agent

- **Agent**: Claude Code (claude-sonnet-4-5)
- **Role**: qa
- **Mode**: workflow agent container

### Verification approach

1. Read spec, provenance from dev pass, and context files
2. Verified all acceptance criteria against actual implementation
3. Created comprehensive automated test suite (`e2e/code-quality.spec.ts`)
4. Ran all validation commands to confirm they work
5. Extended configuration to support test files (required Node types and TypeScript includes)
6. Created scenarios.md documenting test coverage
7. Ran full test suite: 11/11 scenarios passed

### Actions taken

1. Read `sdd/specs/code-quality/spec.md`, `provenance.md`, `sdd/context/architecture.md`
2. Read `.skills/frontend-design/SKILL.md`
3. Verified existence of `eslint.config.mjs`, `package.json` scripts, and dependencies
4. Ran acceptance commands:
   - `pnpm install --frozen-lockfile` — ✅ Pass (lockfile up to date)
   - `pnpm typecheck` — ✅ Pass (no type errors)
   - `pnpm lint` — ✅ Pass (no violations)
   - `pnpm check` — ✅ Pass (both commands succeed)
5. Created `e2e/code-quality.spec.ts` with 11 automated test scenarios covering:
   - Config file validity and structure
   - Package script definitions
   - Dependency presence and versions
   - TypeScript strict mode preservation
   - Command execution and exit codes
   - ESLint ignore patterns
   - TypeScript-aware linting setup
   - lint-staged integration
   - README documentation
6. Created `playwright.config.ts` for Playwright test runner
7. Extended `tsconfig.json` include to `["src", "e2e", "playwright.config.ts"]` to enable type-checking for test files (per spec allowance: "extend config if ESLint needs typed linting for additional roots")
8. Updated `eslint.config.mjs` to apply less strict rules to test files (basic TypeScript recommended vs. strict type-checked) to avoid excessive type-safety warnings in test code
9. Added `@types/node` devDependency to support Node.js APIs in test files
10. Ran `pnpm test:e2e` — ✅ 11/11 tests passed
11. Created `sdd/specs/code-quality/scenarios.md` with full test documentation

### Validation results

All acceptance criteria verified:

| Criterion | Status | Verification method |
|-----------|--------|---------------------|
| `eslint.config.mjs` exists and is valid ESLint 9 flat config | ✅ Pass | File read + automated test scenario 1 |
| Dev dependencies include eslint, typescript-eslint, @eslint/js | ✅ Pass | package.json inspection + test scenario 3 |
| package.json defines typecheck, lint, check scripts | ✅ Pass | Script definitions verified + test scenario 2 |
| `pnpm install` succeeds | ✅ Pass | Executed with --frozen-lockfile; lockfile up to date |
| `pnpm typecheck` exits 0 | ✅ Pass | Manual execution + test scenario 5 |
| `pnpm lint` exits 0 | ✅ Pass | Manual execution + test scenario 6 |
| `pnpm check` exits 0 (runs both in order) | ✅ Pass | Manual execution + test scenario 7 |
| provenance.md exists after dev run | ✅ Pass | File present from dev pass; this is QA append |

### Test coverage

**Automated test suite**: `e2e/code-quality.spec.ts`
**Run command**: `pnpm test:e2e`
**Results**: 11/11 scenarios passed

Test scenarios cover:
1. ESLint config file structure and imports
2. Package script names and ordering
3. Required dependencies and versions
4. TypeScript strict mode setting
5. typecheck command execution
6. lint command execution
7. check command execution and output
8. ESLint ignore patterns
9. TypeScript-aware linting configuration
10. lint-staged pre-commit hooks
11. README.md documentation

Full scenario descriptions in `sdd/specs/code-quality/scenarios.md`.

### Configuration changes for QA

To support automated testing, made the following minimal changes:

1. **tsconfig.json include extended** from `["src"]` to `["src", "e2e", "playwright.config.ts"]`
   - **Rationale**: ESLint type-checking for test files required TypeScript to include them in the project. Spec explicitly allows: "extend config if ESLint needs typed linting for additional roots"
   - **Documented in**: This provenance section

2. **eslint.config.mjs test file rules** — added separate config block for test files using basic TypeScript rules instead of strict type-checked rules
   - **Rationale**: Test files legitimately use `execSync`, `JSON.parse` returning `any`, and other patterns that trigger type-safety warnings but are acceptable in test code
   - **Scope**: Only affects `**/*.spec.ts`, `**/*.test.ts`, `e2e/**/*.ts`, and `playwright.config.ts`

3. **Added @types/node devDependency** for Node.js type definitions
   - **Rationale**: Test files use Node built-ins (`child_process`, `fs`, `path`) which require type definitions
   - **Impact**: No runtime impact; development-only types

These changes maintain compatibility with the spec's requirements while enabling comprehensive automated testing.

### Findings

**No defects found.** All acceptance criteria met. Implementation is correct and complete.

**Positive observations**:
- Dev agent properly preserved TypeScript strict mode
- ESLint configuration correctly separates type-checked rules for app code vs. basic rules for infrastructure
- Infrastructure directories appropriately ignored (sdd/, .husky/, .forgejo/)
- lint-staged integration follows existing patterns in package.json
- README documentation clear and includes usage examples
- Placeholder src/main.ts approach was reasonable given TypeScript's requirement for at least one input file

**Coverage notes**:
- All 8 spec acceptance criteria verified with passing tests
- All commands execute successfully with exit code 0
- Configuration files valid and parseable
- Dependencies correctly installed and versioned
- Documentation complete

### Artifacts produced

| Path | Status | Description |
|------|--------|-------------|
| `e2e/code-quality.spec.ts` | Created | 11 automated test scenarios (11/11 pass) |
| `playwright.config.ts` | Created | Playwright test runner configuration |
| `eslint.config.mjs` | Modified | Added test file rule block (basic TS rules for tests) |
| `tsconfig.json` | Modified | Extended include to cover e2e and playwright.config.ts |
| `package.json` | Modified | Added @types/node devDependency |
| `pnpm-lock.yaml` | Modified | Lockfile updated with @types/node |
| `sdd/specs/code-quality/scenarios.md` | Created | QA scenario documentation |
| `sdd/specs/code-quality/provenance.md` | Appended | This QA section |

### Conclusion

Implementation verified against all acceptance criteria. All validation commands succeed. Comprehensive automated test suite (11 scenarios) provides ongoing verification. No defects or gaps found. Implementation ready for production use and serves as a solid foundation for future specs that depend on `pnpm check` / `pnpm lint` / `pnpm typecheck`.
