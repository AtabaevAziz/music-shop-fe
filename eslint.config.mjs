/**
 * @type {import("eslint").Linter.Config[]}
 */
import { FlatCompat } from "@eslint/eslintrc";
import query from "@tanstack/eslint-plugin-query";
import prettierConfig from "eslint-config-prettier";
import checkFile from "eslint-plugin-check-file";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({ extends: ["next/core-web-vitals", "next/typescript"] }),

  ...query.configs["flat/recommended"],

  prettierConfig,

  {
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "check-file/no-index": "error",
      "check-file/filename-blocklist": [
        "error",
        {
          "src/**/*.js": "*.ts",
          "src/**/*.jsx": "*.tsx",
        },
      ],
      "check-file/filename-naming-convention": [
        "error",
        {
          "src/**/*.{ts,tsx}": "KEBAB_CASE",
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/**/": "NEXT_JS_APP_ROUTER_CASE",
        },
      ],
    },
  },
];

export default eslintConfig;
