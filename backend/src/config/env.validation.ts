/**
 * Environment contract for the API.
 *
 * `ConfigModule.forRoot({ validate })` runs this once during boot, so a missing
 * or malformed variable kills the process with a readable message instead of
 * surfacing as `undefined` deep inside a request handler months later. A new
 * variable gets a line here, and in `Env`, before any code reads it.
 */

export type NodeEnv = "development" | "production" | "test";

export interface Env {
  NODE_ENV: NodeEnv;
  PORT: number;
  /** Bare origin (`scheme://host[:port]`), trailing slash and path stripped. */
  FRONTEND_ORIGIN: string;
  DATABASE_URL: string;
}

const NODE_ENVS: readonly NodeEnv[] = ["development", "production", "test"];

function parseUrl(value: string): URL | undefined {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

/** Reads a variable as a string, treating "" as absent so a blank line in
 *  `.env` falls back to the default rather than failing validation. */
function read(
  raw: Record<string, unknown>,
  key: keyof Env,
): string | undefined {
  const value = raw[key];
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return value.trim();
}

export function validate(raw: Record<string, unknown>): Env {
  const errors: string[] = [];

  const nodeEnv = read(raw, "NODE_ENV") ?? "development";
  if (!NODE_ENVS.includes(nodeEnv as NodeEnv)) {
    errors.push(
      `NODE_ENV must be one of ${NODE_ENVS.join(" | ")} — received "${nodeEnv}"`,
    );
  }

  const rawPort = read(raw, "PORT") ?? "4000";
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(
      `PORT must be an integer between 1 and 65535 — received "${rawPort}"`,
    );
  }

  const rawFrontendOrigin =
    read(raw, "FRONTEND_ORIGIN") ?? "http://localhost:3000";
  // CORS and the Origin check compare exact strings, so "http://localhost:3000/"
  // would silently reject every request. Normalise to the bare origin.
  const frontendOrigin = parseUrl(rawFrontendOrigin)?.origin;
  if (!frontendOrigin || frontendOrigin === "null") {
    errors.push(
      `FRONTEND_ORIGIN must be an absolute URL — received "${rawFrontendOrigin}"`,
    );
  }

  // No default: guessing a database is how a dev server ends up migrating the
  // wrong one. The value itself is never echoed — it carries a password.
  const databaseUrl = read(raw, "DATABASE_URL");
  const databaseProtocol = databaseUrl && parseUrl(databaseUrl)?.protocol;
  if (!databaseUrl) {
    errors.push(
      "DATABASE_URL is required — see backend/.env.example for the format",
    );
  } else if (
    databaseProtocol !== "postgresql:" &&
    databaseProtocol !== "postgres:"
  ) {
    errors.push("DATABASE_URL must be a postgresql:// connection string");
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment:\n${errors.map((error) => `  - ${error}`).join("\n")}`,
    );
  }

  return {
    NODE_ENV: nodeEnv as NodeEnv,
    PORT: port,
    FRONTEND_ORIGIN: frontendOrigin!,
    DATABASE_URL: databaseUrl!,
  };
}
