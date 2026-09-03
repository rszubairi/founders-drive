import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The Convex data layer is loosely typed at the component boundary
      // (fully typed inside convex/). Keep `any` as a warning, not an error.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // convex/_generated is machine-generated; convex/ is linted by `convex dev`.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "convex/_generated/**",
  ]),
]);

export default eslintConfig;
