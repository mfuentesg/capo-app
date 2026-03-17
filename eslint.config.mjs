import { dirname } from "path"
import { fileURLToPath } from "url"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "coverage",
      "supabase/functions/**",
      "public/sw.js",
      "public/swe-worker-*.js",
      ".worktrees/**"
    ]
  },
  ...nextVitals,
  ...nextTs,
  // Type-aware rule set applied to TypeScript files. We enable the
  // parser/project option so rules like no-explicit-any and
  // no-unsafe-assignment can use type information.
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname
      }
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      // Enforce no explicit any usage and strict type-safety rules.
      // These are set to error so CI/Lint fails when unsafely-typed values are used.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/restrict-template-expressions": "error",

      // ── Mobile performance guards ────────────────────────────────────────
      // `transition-all` animates every CSS property simultaneously. On mobile
      // GPUs this is significantly more expensive than animating only the
      // properties that actually change (e.g. transition-colors, transition-opacity).
      // Use a specific transition utility instead: transition-colors, transition-opacity,
      // transition-transform, transition-shadow, or transition-none.
      "no-restricted-syntax": [
        "error",
        {
          // Catches bare string literals: className="... transition-all ..."
          selector: "Literal[value=/\\btransition-all\\b/]",
          message:
            "Avoid 'transition-all' — it animates every CSS property and causes unnecessary GPU work on mobile. Use transition-colors, transition-opacity, transition-transform, or transition-shadow instead."
        },
        {
          // Catches template literal segments: className={`... transition-all ...`}
          selector: "TemplateElement[value.raw=/\\btransition-all\\b/]",
          message:
            "Avoid 'transition-all' — it animates every CSS property and causes unnecessary GPU work on mobile. Use transition-colors, transition-opacity, transition-transform, or transition-shadow instead."
        }
      ]
    }
  }
]

export default eslintConfig
