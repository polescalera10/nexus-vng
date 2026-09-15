import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      // Permite descartar variables/argumentos prefijados con "_".
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // database.generated.ts sale de `supabase gen types`: no se toca a mano.
    // `eslint .` barre todo el repo (no solo src/ como `next lint`), así que
    // hay que excluir builds, informes y los worktrees de Claude Code.
    ignores: [
      "design-reference/**",
      "**/.next/**",
      "node_modules/**",
      ".claude/**",
      "public/**",
      "playwright-report/**",
      "test-results/**",
      "blob-report/**",
      "coverage/**",
      "next-env.d.ts",
      "src/types/database.generated.ts",
    ],
  },
];

export default eslintConfig;
