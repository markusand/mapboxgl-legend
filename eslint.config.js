import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ['src/**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.es2019,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // Downgrade rules that weren't errors in the original @typescript-eslint v6 config
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Custom rules from original .eslintrc
      'max-len': ['error', {
        code: 100,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
      }],
      'no-param-reassign': ['error', { props: false }],
      'no-shadow': ['error', {
        allow: ['response', 'data'],
      }],
      'object-curly-newline': ['error', {
        multiline: true,
        consistent: true,
      }],
      'arrow-parens': ['error', 'as-needed'],
      'no-nested-ternary': 'off',
      'no-underscore-dangle': 'off',
      'import/no-absolute-path': 'off',
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/extensions': ['error', 'ignorePackages', {
        js: 'never',
        ts: 'never',
      }],
    },
  },
];
