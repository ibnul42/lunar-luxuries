import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// The Prisma CLI does not read env files itself. Load them in the same order
// as the API's ConfigModule (`.env.local` wins over `.env`) so `migrate` and
// the running server always agree on which database they mean.
config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Read directly rather than through `env()`, which throws when unset —
    // `prisma generate` (run on every install) needs no database at all.
    url: process.env["DATABASE_URL"],
  },
});
