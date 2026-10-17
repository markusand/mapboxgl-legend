import path from 'path';
import { defineConfig } from 'vite-plus';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  // Git pre-commit hooks: run check+fix on all staged files
  staged: {
    '*': 'vp check --fix',
  },

  // Code formatting (Prettier-compatible options via vite-plus)
  fmt: {
    singleQuote: true,
    arrowParens: 'avoid',
    printWidth: 100,
    sortPackageJson: false,
    ignorePatterns: ['index.html'],
  },

  // Linting (oxlint via vite-plus): plugins, base rules, and TypeScript overrides
  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'import'],
    categories: {
      correctness: 'warn',
    },
    env: {
      builtin: true,
      es2018: true,
    },
    rules: {
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'error',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-empty-static-block': 'error',
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-obj-calls': 'error',
      'no-prototype-builtins': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-self-assign': 'error',
      'no-setter-return': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-undef': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-labels': 'error',
      'no-unused-private-class-members': 'error',
      'no-unused-vars': 'error',
      'no-useless-backreference': 'error',
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      'no-with': 'error',
      'require-yield': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'import/no-duplicates': 'warn',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    overrides: [
      {
        files: ['src/**/*.ts'],
        rules: {
          'no-array-constructor': 'error',
          'no-unused-expressions': 'error',
          'no-unused-vars': [
            'error',
            {
              argsIgnorePattern: '^_',
            },
          ],
          'no-param-reassign': [
            'error',
            {
              props: false,
            },
          ],
          'no-shadow': [
            'error',
            {
              allow: ['response', 'data'],
            },
          ],
          'no-nested-ternary': 'off',
          'no-underscore-dangle': 'off',
          'import/no-absolute-path': 'off',
          'import/extensions': [
            'error',
            'ignorePackages',
            {
              js: 'never',
              ts: 'never',
            },
          ],
          'typescript/ban-ts-comment': 'warn',
          'typescript/no-duplicate-enum-values': 'error',
          'typescript/no-empty-object-type': 'error',
          'typescript/no-explicit-any': 'warn',
          'typescript/no-extra-non-null-assertion': 'error',
          'typescript/no-misused-new': 'error',
          'typescript/no-namespace': 'error',
          'typescript/no-non-null-asserted-optional-chain': 'error',
          'typescript/no-require-imports': 'error',
          'typescript/no-this-alias': 'error',
          'typescript/no-unnecessary-type-constraint': 'error',
          'typescript/no-unsafe-declaration-merging': 'error',
          'typescript/no-unsafe-function-type': 'warn',
          'typescript/no-wrapper-object-types': 'error',
          'typescript/prefer-as-const': 'error',
          'typescript/prefer-namespace-keyword': 'error',
          'typescript/triple-slash-reference': 'error',
        },
        env: {
          browser: true,
          es2019: true,
        },
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
  },

  // Vite module resolution
  resolve: {
    alias: [{ find: '/@', replacement: path.resolve(import.meta.dirname, './src') }],
  },

  // Library bundling: ESM + UMD outputs with .d.ts generation
  pack: {
    entry: ['src/index.ts'],
    format: ['esm', 'umd'],
    globalName: 'LegendControl',
    dts: true,
    minify: true,
    deps: { neverBundle: ['mapbox-gl'] },
    outExtensions: ({ format }) =>
      format === 'umd' ? { js: '.cjs' } : { js: '.es.js', dts: '.d.ts' },
  },

  // PostCSS processing
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },

  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    restoreMocks: true,
    isolate: false, // reuse workers across files; re-enable if tests leak state
  },
});
