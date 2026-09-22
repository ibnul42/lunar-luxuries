// @ts-check
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // `eslint.config.mjs` is not in tsconfig's `include`, so the type-aware rules
  // below cannot lint it. Ignore it rather than widen the project.
  { ignores: ["dist/**", "eslint.config.mjs"] },

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
