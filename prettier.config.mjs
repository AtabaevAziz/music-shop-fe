/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config
 *  & import("@trivago/prettier-plugin-sort-imports").PluginConfig
 *  & import("prettier-plugin-tailwindcss").PluginOptions
 * }
 */

const config = {
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: ["<THIRD_PARTY_MODULES>", "^@/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  tailwindFunctions: ["clx"],
};

export default config;
