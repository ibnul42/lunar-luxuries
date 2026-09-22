/**
 * Environment contract for the API.
 *
 * `ConfigModule.forRoot({ validate })` runs this once during boot, so a missing
 * or malformed variable kills the process with a readable message instead of
 * surfacing as `undefined` deep inside a request handler months later. When
 * `DATABASE_URL` arrives, it gets a line here before it gets a client.
 */

export type NodeEnv = "development" | "production" | "test";

export interface Env {
  NODE_ENV: NodeEnv;
  PORT: number;
  FRONTEND_ORIGIN: string;
}

const NODE_ENVS: readonly NodeEnv[] = ["development", "production", "test"];

function isAbsoluteUrl(value: string): boolean {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
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

  const frontendOrigin =
    read(raw, "FRONTEND_ORIGIN") ?? "http://localhost:3000";
  if (!isAbsoluteUrl(frontendOrigin)) {
    errors.push(
      `FRONTEND_ORIGIN must be an absolute URL — received "${frontendOrigin}"`,
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment:\n${errors.map((error) => `  - ${error}`).join("\n")}`,
    );
  }

  return {
    NODE_ENV: nodeEnv as NodeEnv,
    PORT: port,
    FRONTEND_ORIGIN: frontendOrigin,
  };
}
