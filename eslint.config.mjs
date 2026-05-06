import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '.tmp/',
      'test-results/',
      'playwright-report/',
      'playwright/.cache/',
      'sdd/',
      '.husky/',
      '.forgejo/',
    ],
  },

  // Base JS recommended for all files
  js.configs.recommended,

  // TypeScript-aware rules only for TS files (excluding test files which use looser types)
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.spec.ts', '**/*.test.ts', 'e2e/**', 'playwright.config.ts'],
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Basic TypeScript rules for test files (no strict type checking)
  {
    files: ['**/*.spec.ts', '**/*.test.ts', 'e2e/**/*.ts', 'playwright.config.ts'],
    extends: tseslint.configs.recommended,
  },
);
