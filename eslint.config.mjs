import { defineConfig, globalIgnores } from 'eslint/config'
import { configs } from '@eslint/js'
import { commonjs, node, mongo, browser, mocha, chai } from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
  configs.recommended,
  globalIgnores(['coverage/**/*']),
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: "latest",
      globals: {
        ...commonjs,
        ...node,
        ...browser,
      },
    },
    rules: {
      /* --- Possible Bugs --- */
      "eqeqeq": ["error", "always"],          // require === and !==
      "no-console": "off",                   // allow console
      "no-undef": "error",                    // disallow undeclared vars
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-prototype-builtins": "warn",        // avoid direct obj.hasOwnProperty
      "require-atomic-updates": "error",      // avoid race conditions with await

      /* --- Best Practices --- */
      "curly": ["error", "all"],              // always use {}
      "dot-notation": "error",                // enforce obj.prop over obj["prop"]
      "no-multi-spaces": "error",             // disallow double spaces
      "no-return-await": "error",             // return await unnecessary
      "prefer-const": "error",                // enforce const when let never reassigned
      'no-var': 'error',                      // Require let/const instead of var
      "prefer-template": "error",             // enforce template strings
      "object-shorthand": ["error", "always"],// use { foo } instead of { foo: foo }
      "arrow-body-style": ["error", "as-needed"],

      /* --- Style & Consistency --- */
      "semi": ["error", "always"],
      "quotes": ["error", "double", { avoidEscape: true }],
      "indent": ["error", 2, { SwitchCase: 1 }],
      "comma-dangle": ["error", "always-multiline"],
      'comma-style': ['error', 'last'],
      'comma-spacing': ['error', { before: false, after: true }],
      "space-before-function-paren": ["error", "never"],
      "keyword-spacing": ["error", { before: true, after: true }],
      "space-infix-ops": "error",
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'always'],
      'func-name-matching': ['error', 'always'],
      'func-names': 'off',
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'func-call-spacing': ['error', 'never'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'max-len': [ 'warn', { code: 100, tabWidth: 2, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true } ],
      'max-params': ['warn', 4],
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 5],
      complexity: ['warn', { max: 20 }], //Default: 'complexity': ['warn', 10],
      'max-statements': ['off', { max: 10 }],
    },
    linterOptions: { noInlineConfig: false, reportUnusedDisableDirectives: 'warn' },
  },
  eslintConfigPrettier,
])
