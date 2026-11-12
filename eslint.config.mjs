import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'blob-report/',
      'allure-results/',
      'allure-report/',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-focused-test': 'error', // no test.only committed
      'playwright/no-wait-for-timeout': 'error', // no hard waits
      'playwright/no-skipped-test': 'warn',
      'playwright/expect-expect': [
        'warn',
        { assertFunctionNames: ['expectLoaded', 'expectNoWcagViolations', 'expectOnlyKnownBestPracticeIssues'] },
      ],
    },
  },

  {
    rules: {
      '@typescript-eslint/no-floating-promises': 'off', // requires type-aware linting
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  prettier, // must be last: turns off rules that conflict with Prettier
);
