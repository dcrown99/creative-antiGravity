import sharedConfig from "@repo/config/eslint.config.mjs";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...sharedConfig,
  // アプリ固有のルールがあればここに追加
];

export default eslintConfig;
