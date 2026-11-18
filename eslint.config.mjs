import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const reactHooksPlugin = nextVitals.find(
  (config) => config.plugins && "react-hooks" in config.plugins
)?.plugins?.["react-hooks"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  ...(reactHooksPlugin
    ? [
        {
          plugins: { "react-hooks": reactHooksPlugin },
          rules: {
            "react-hooks/set-state-in-effect": "warn",
          },
        },
      ]
    : []),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
