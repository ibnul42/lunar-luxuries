// @ts-check
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // `eslint.config.mjs` is not in tsconfig's `include`, so the type-aware rules
  // below cannot lint it. Ignore it rather than widen the project.
  // `src/generated/` is the Prisma client — `npm run db:generate` rewrites it.
  { ignores: ["dist/**", "src/generated/**", "eslint.config.mjs"] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
