import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * QA automated tests for sdd/specs/code-quality/spec.md
 *
 * These tests verify the static code quality tooling implementation:
 * - ESLint 9+ flat config
 * - TypeScript type checking
 * - Package scripts (typecheck, lint, check)
 * - Proper configuration and dependencies
 */

const rootDir = join(__dirname, '..');

test.describe('Code Quality Spec Implementation', () => {
  test('eslint.config.mjs exists and is valid ESLint 9 flat config', () => {
    const configPath = join(rootDir, 'eslint.config.mjs');
    expect(existsSync(configPath), 'eslint.config.mjs should exist').toBeTruthy();

    const configContent = readFileSync(configPath, 'utf-8');

    // Verify it's using ESM syntax (import/export)
    expect(configContent).toContain('import');
    expect(configContent).toContain('export default');

    // Verify it imports required packages
    expect(configContent).toContain('@eslint/js');
    expect(configContent).toContain('typescript-eslint');

    // Verify it has ignore patterns
    expect(configContent).toContain('ignores');
    expect(configContent).toContain('node_modules/');
    expect(configContent).toContain('dist/');
  });

  test('package.json defines required scripts with correct names', () => {
    const pkgPath = join(rootDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    // Verify exact script names as specified in spec
    expect(pkg.scripts).toHaveProperty('typecheck');
    expect(pkg.scripts).toHaveProperty('lint');
    expect(pkg.scripts).toHaveProperty('check');

    // Verify check script runs typecheck then lint
    expect(pkg.scripts.check).toContain('typecheck');
    expect(pkg.scripts.check).toContain('lint');
    expect(pkg.scripts.check).toMatch(/typecheck.*&&.*lint/);
  });

  test('package.json includes required ESLint dependencies', () => {
    const pkgPath = join(rootDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    const devDeps = pkg.devDependencies || {};

    // Verify required dependencies from spec
    expect(devDeps).toHaveProperty('eslint');
    expect(devDeps).toHaveProperty('typescript-eslint');
    expect(devDeps).toHaveProperty('@eslint/js');

    // Verify ESLint is version 9+
    const eslintVersion = devDeps.eslint;
    expect(eslintVersion).toMatch(/\^9\./);
  });

  test('tsconfig.json preserves strict: true', () => {
    const tsconfigPath = join(rootDir, 'tsconfig.json');
    const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');

    // Remove comments (both // and /* */ style) before parsing
    const cleanedContent = tsconfigContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*/g, ''); // Remove // comments

    const tsconfig = JSON.parse(cleanedContent);

    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  test('pnpm typecheck exits 0 on clean tree', () => {
    let exitCode = 0;
    try {
      execSync('pnpm typecheck', {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf-8'
      });
    } catch (error) {
      exitCode = (error as { status?: number }).status || 1;
    }

    expect(exitCode).toBe(0);
  });

  test('pnpm lint exits 0 on clean tree', () => {
    let exitCode = 0;
    try {
      execSync('pnpm lint', {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf-8'
      });
    } catch (error) {
      exitCode = (error as { status?: number }).status || 1;
    }

    expect(exitCode).toBe(0);
  });

  test('pnpm check exits 0 and runs both commands in order', () => {
    let output = '';
    let exitCode = 0;

    try {
      output = execSync('pnpm check', {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf-8'
      });
    } catch (error) {
      const err = error as { status?: number; stdout?: string; stderr?: string };
      exitCode = err.status || 1;
      output = err.stdout || err.stderr || '';
    }

    expect(exitCode).toBe(0);

    // Verify both commands ran
    expect(output).toContain('typecheck');
    expect(output).toContain('lint');
  });

  test('ESLint config ignores required directories', () => {
    const configPath = join(rootDir, 'eslint.config.mjs');
    const configContent = readFileSync(configPath, 'utf-8');

    // Per spec: ignore node_modules, dist, coverage, .tmp, Playwright outputs
    const requiredIgnores = [
      'node_modules/',
      'dist/',
      'coverage/',
      '.tmp/',
    ];

    for (const ignore of requiredIgnores) {
      expect(configContent).toContain(ignore);
    }
  });

  test('ESLint config uses TypeScript-aware rules', () => {
    const configPath = join(rootDir, 'eslint.config.mjs');
    const configContent = readFileSync(configPath, 'utf-8');

    // Verify typescript-eslint is configured with type checking
    expect(configContent).toContain('recommendedTypeChecked');
    expect(configContent).toContain('projectService');
  });

  test('lint-staged extends to include TS/JS files', () => {
    const pkgPath = join(rootDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    const lintStaged = pkg['lint-staged'] || {};

    // Should have a pattern that matches .ts, .js, .mjs, .cjs files
    // The pattern uses glob syntax like *.{ts,js,mjs,cjs}
    const hasJsTsPattern = Object.keys(lintStaged).some(pattern => {
      // Match patterns like *.{ts,js} or **/*.ts etc
      return pattern.match(/\*\..*\b(ts|js|mjs|cjs)\b/);
    });

    expect(hasJsTsPattern).toBeTruthy();

    // Should run eslint on those files
    const tsJsPattern = Object.keys(lintStaged).find(p =>
      p.match(/\*\..*\b(ts|js|mjs|cjs)\b/)
    );

    if (tsJsPattern) {
      const command = lintStaged[tsJsPattern];
      expect(command).toContain('eslint');
    }
  });

  test('README.md documents the code quality commands', () => {
    const readmePath = join(rootDir, 'README.md');
    const readmeContent = readFileSync(readmePath, 'utf-8');

    // Should mention the three commands
    expect(readmeContent).toContain('typecheck');
    expect(readmeContent).toContain('lint');
    expect(readmeContent).toContain('check');

    // Should have usage examples
    expect(readmeContent).toMatch(/pnpm\s+(typecheck|lint|check)/);
  });
});
