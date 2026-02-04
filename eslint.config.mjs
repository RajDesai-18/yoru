import nextPlugin from "eslint-config-next/core-web-vitals";
import tsPlugin from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "build/**"],
  },
  ...nextPlugin,
  ...tsPlugin,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
