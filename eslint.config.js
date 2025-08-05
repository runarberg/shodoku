import js from "@eslint/js";
import gitignore from "eslint-config-flat-gitignore";
import prettier from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vue from "eslint-plugin-vue";
import globals from "globals";
import ts from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default ts.config(
  gitignore(),

  js.configs.recommended,

  ...ts.configs.recommended,
  ...vue.configs["flat/recommended"],

  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },

  {
    files: ["**/*.{ts,vue}"],

    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
      },
    },
  },

  {
    files: ["**/*.js", "**/*.ts", "**/*.vue"],

    languageOptions: {
      globals: globals["shared-node-browser"],
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "accessor-pairs": "error",
      "array-callback-return": "error",
      "class-methods-use-this": "error",
      curly: ["error", "all"],
      eqeqeq: [
        "error",
        "always",
        {
          null: "ignore",
        },
      ],
      "grouped-accessor-pairs": "error",
      "no-alert": "error",
      "no-caller": "error",
      "no-console": "warn",
      "no-debugger": "warn",
      "no-duplicate-imports": "error",
      "no-else-return": [
        "error",
        {
          allowElseIf: false,
        },
      ],
      "no-eval": "error",
      "no-extend-native": "error",
      "no-extra-bind": "error",
      "no-implicit-coercion": "error",
      "no-implied-eval": "error",
      "no-invalid-this": "error",
      "no-lone-blocks": "error",
      "no-multi-str": "error",
      "no-new": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-octal-escape": "error",
      "no-param-reassign": "error",
      "no-return-assign": "error",
      "no-return-await": "error",
      "no-script-url": "error",
      "no-self-compare": "error",
      "no-sequences": "error",
      "no-shadow": "error",
      "no-template-curly-in-string": "error",
      "no-throw-literal": "error",
      "no-unmodified-loop-condition": "error",
      "no-unused-expressions": "error",
      "no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-useless-backreference": "error",
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "no-void": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-destructuring": [
        "error",
        {
          VariableDeclarator: {
            array: true,
            object: true,
          },
          AssignmentExpression: {
            array: false,
            object: false,
          },
        },
      ],
      "prefer-promise-reject-errors": "error",
      "prefer-template": "error",
      radix: ["error", "as-needed"],
      "require-atomic-updates": "error",
    },
  },

  {
    files: ["**/*.{ts,vue}"],
    rules: {
      "no-shadow": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  {
    files: ["**/*.js"],
    rules: {
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  {
    files: ["*.config.js", "scripts/**/*.js", "vite-plugins/**/*.{js,ts}"],

    languageOptions: {
      globals: globals.nodeBuiltin,
    },
  },

  {
    files: ["src/**/*.{js,ts,vue}"],

    languageOptions: {
      globals: globals.browser,
    },
  },

  {
    files: ["src/**/*.worker.{js,ts}"],

    languageOptions: {
      globals: globals.worker,
    },
  },

  prettier,
);
