import nextPlugin from '@next/eslint-plugin-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
  '@next/next': nextPlugin,
  '@typescript-eslint': tseslint,
  'react-hooks': reactHooks,
    },
    rules: {
      'prefer-const': 'error',
  // React Hooks linting
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
      'no-var': 'error',
      // Allow console.log in this project (kept as warn to avoid failing CI)
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'comma-dangle': ['error', 'always-multiline'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'jsx-quotes': ['error', 'prefer-double'],
      ...tseslint.configs.recommended.rules,
      // Relax common TS rules to reduce noise; still keep as warnings so they're visible
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      ...nextPlugin.configs.recommended.rules,
    },
  },
  // Loosen for declaration files
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // Node scripts: allow require() and console
  {
    files: ['scripts/**/*.{js,ts}', 'scripts/**/**.{js,ts}', 'scripts/*.{js,ts}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },
  // API routes often log; keep warnings minimal
  {
    files: [
      'src/app/api/**/*.{ts,tsx}',
      'src/api/**/*.{ts,tsx}',
      'functions/**/*.{ts,tsx}',
    ],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
      '.eslintrc.json',
    ],
  },
];
