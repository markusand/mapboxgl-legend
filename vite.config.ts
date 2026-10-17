import path from 'path';
import { defineConfig, lazyPlugins } from 'vite-plus';
import dts from 'vite-plugin-dts';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    singleQuote: true,
    arrowParens: 'avoid',
    printWidth: 100, // your old max-len
    sortPackageJson: false, // keeps package.json field order as-is
  },
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
  resolve: {
    alias: [{ find: '/@', replacement: path.resolve(import.meta.dirname, './src') }],
  },
  plugins: lazyPlugins(() => [
    dts({
      include: ['src'],
      exclude: ['src/**/__tests__'],
      compilerOptions: { rootDir: 'src' },
      bundleTypes: true,
    }),
  ]),
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    globals: true,
    environment: 'jsdom',
    restoreMocks: true,
  },
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.ts'),
      name: 'LegendControl',
      cssFileName: 'style',
      fileName: format => (format === 'umd' ? 'index.umd.cjs' : `index.${format}.js`),
    },
  },
});
