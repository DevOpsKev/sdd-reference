---
title: Code Quality QA Scenarios
spec: sdd/specs/code-quality
---

# QA Scenarios: Code Quality Tooling

This document describes the test scenarios executed to verify the code-quality spec implementation. All scenarios are backed by automated tests in `e2e/code-quality.spec.ts` that can be run via `pnpm test:e2e`.

## Automated Test Suite

**Test file**: `e2e/code-quality.spec.ts`
**Run command**: `pnpm test:e2e`
**Framework**: Playwright Test (@playwright/test)
**Results**: 11/11 scenarios passed

### Scenario 1: ESLint flat config exists and is valid

**ID**: `eslint-config-valid`
**Intent**: Verify ESLint 9+ flat config file exists with correct structure
**Spec requirement**: [Acceptance criterion 1] `eslint.config.mjs` exists at repo root
**Steps**:
1. Check that `eslint.config.mjs` exists at repo root
2. Verify file uses ESM syntax (import/export)
3. Verify imports `@eslint/js` and `typescript-eslint`
4. Verify includes ignore patterns for node_modules and dist

**Expected outcome**: File exists with valid ESLint 9 flat config structure
**Result**: ✅ PASS

---

### Scenario 2: Package scripts defined correctly

**ID**: `package-scripts`
**Intent**: Verify package.json defines typecheck, lint, and check scripts with exact names
**Spec requirement**: [Package scripts table] exact script names required
**Steps**:
1. Read package.json
2. Verify `typecheck` script exists
3. Verify `lint` script exists
4. Verify `check` script exists
5. Verify `check` runs `typecheck && lint` in order

**Expected outcome**: All three scripts defined with correct names and check runs both
**Result**: ✅ PASS

---

### Scenario 3: Required ESLint dependencies installed

**ID**: `eslint-dependencies`
**Intent**: Verify all required ESLint packages are in devDependencies
**Spec requirement**: [ESLint section] dependencies list
**Steps**:
1. Read package.json devDependencies
2. Verify `eslint` is present
3. Verify `typescript-eslint` is present
4. Verify `@eslint/js` is present
5. Verify ESLint version is 9.x or higher

**Expected outcome**: All packages present with correct versions
**Result**: ✅ PASS

---

### Scenario 4: TypeScript strict mode preserved

**ID**: `typescript-strict`
**Intent**: Verify tsconfig.json maintains strict: true as required
**Spec requirement**: [TypeScript section] preserve strict: true
**Steps**:
1. Read tsconfig.json (with comment stripping for JSON parsing)
2. Extract compilerOptions.strict value
3. Verify it equals true

**Expected outcome**: strict: true is set
**Result**: ✅ PASS

---

### Scenario 5: pnpm typecheck passes on clean tree

**ID**: `typecheck-command`
**Intent**: Verify TypeScript compilation succeeds without errors
**Spec requirement**: [Acceptance criterion 5] `pnpm typecheck` exits 0
**Steps**:
1. Execute `pnpm typecheck` via child_process.execSync
2. Capture exit code
3. Verify exit code is 0

**Expected outcome**: Command exits with code 0 (no type errors)
**Result**: ✅ PASS

---

### Scenario 6: pnpm lint passes on clean tree

**ID**: `lint-command`
**Intent**: Verify ESLint finds no violations
**Spec requirement**: [Acceptance criterion 6] `pnpm lint` exits 0
**Steps**:
1. Execute `pnpm lint` via child_process.execSync
2. Capture exit code
3. Verify exit code is 0

**Expected outcome**: Command exits with code 0 (no lint errors)
**Result**: ✅ PASS

---

### Scenario 7: pnpm check runs both commands

**ID**: `check-command`
**Intent**: Verify check script runs typecheck and lint in correct order
**Spec requirement**: [Acceptance criterion 7] `pnpm check` exits 0 and runs both
**Steps**:
1. Execute `pnpm check` via child_process.execSync
2. Capture exit code and output
3. Verify exit code is 0
4. Verify output contains 'typecheck'
5. Verify output contains 'lint'

**Expected outcome**: Command exits 0 and both sub-commands execute
**Result**: ✅ PASS

---

### Scenario 8: ESLint ignores generated directories

**ID**: `eslint-ignores`
**Intent**: Verify ESLint config properly ignores build artifacts and generated files
**Spec requirement**: [ESLint section] ignore node_modules/, dist/, coverage/, .tmp/, etc.
**Steps**:
1. Read eslint.config.mjs content
2. Verify ignores array contains 'node_modules/'
3. Verify ignores array contains 'dist/'
4. Verify ignores array contains 'coverage/'
5. Verify ignores array contains '.tmp/'

**Expected outcome**: All required ignore patterns present
**Result**: ✅ PASS

---

### Scenario 9: TypeScript-aware linting configured

**ID**: `typescript-eslint-setup`
**Intent**: Verify ESLint uses TypeScript type-checking for TS files
**Spec requirement**: [ESLint section] TypeScript-aware rules via typescript-eslint
**Steps**:
1. Read eslint.config.mjs content
2. Verify config includes 'recommendedTypeChecked'
3. Verify config enables 'projectService' for type-aware linting

**Expected outcome**: Type-checked rules properly configured
**Result**: ✅ PASS

---

### Scenario 10: lint-staged hooks TS/JS files

**ID**: `lint-staged-config`
**Intent**: Verify git pre-commit hooks run ESLint on staged TypeScript/JavaScript files
**Spec requirement**: [Husky/lint-staged section] extend lint-staged for *.{ts,js}
**Steps**:
1. Read package.json lint-staged configuration
2. Verify pattern exists matching .ts, .js, .mjs, or .cjs files (glob syntax)
3. Verify matched pattern's command contains 'eslint'

**Expected outcome**: lint-staged configured to lint TS/JS files on commit
**Result**: ✅ PASS

---

### Scenario 11: README documents commands

**ID**: `readme-documentation`
**Intent**: Verify README.md documents the code quality commands for users
**Spec requirement**: [Documentation section] document pnpm check/lint/typecheck
**Steps**:
1. Read README.md content
2. Verify mentions 'typecheck'
3. Verify mentions 'lint'
4. Verify mentions 'check'
5. Verify shows usage pattern like `pnpm typecheck` etc.

**Expected outcome**: All three commands documented with usage examples
**Result**: ✅ PASS

---

## Additional Implementation Notes

### Configuration choices verified

- **ESLint config filename**: `eslint.config.mjs` (ESM extension used)
- **Test file linting**: Test files (`*.spec.ts`, `*.test.ts`, `e2e/**`) use basic TypeScript rules without strict type-checking to avoid excessive type safety warnings in test code
- **TypeScript includes**: Extended to cover `src`, `e2e`, and `playwright.config.ts`
- **Node types**: Added `@types/node` as devDependency to support Node.js APIs in test code

### Files created during QA

- `e2e/code-quality.spec.ts` — 11 automated test scenarios
- `playwright.config.ts` — Playwright test runner configuration
- Updated `eslint.config.mjs` — Added separate rule block for test files
- Updated `tsconfig.json` — Extended include to cover e2e directory
- Updated `package.json` — Added `@types/node` devDependency

### Validation commands

All commands succeed with exit code 0:

```bash
pnpm install --frozen-lockfile   # Lockfile up to date
pnpm typecheck                   # No type errors
pnpm lint                        # No lint violations
pnpm check                       # Both pass in sequence
pnpm test:e2e                    # 11/11 tests pass
```

## Summary

All 11 scenarios passed. The code-quality spec implementation is complete and correct:

- ESLint 9 flat config properly set up with TypeScript support
- All required package scripts (typecheck, lint, check) work correctly
- TypeScript strict mode preserved
- Dependencies correctly installed
- Ignore patterns configured
- lint-staged hooks integrated
- README documentation added
- Automated test suite provides ongoing verification

No defects found. Implementation ready for use by workflow agents and human contributors.
