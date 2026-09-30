import { SITE } from "@/lib/site";

/**
 * Every error the API can return, in one shape.
 *
 * `fieldErrors` mirrors the `errors` object the API sends for a 400 or 409
 * (backend/src/common/validation-errors.ts), so a form can put a message next
 * to the input that caused it. `status` is 0 when the request never arrived.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: Readonly<Record<string, string>> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const NETWORK_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";
const SERVER_MESSAGE = "Something went wrong on our side. Please try again.";

interface ApiErrorBody {
  message?: unknown;
  errors?: unknown;
}

function readMessage(body: ApiErrorBody, status: number): string {
  if (status >= 500) return SERVER_MESSAGE;
  const { message } = body;
  if (typeof message === "string" && message) return message;
  // Nest's default pipe format, in case a route skips our exception factory.
  if (Array.isArray(message) && typeof message[0] === "string") {
    return message[0];
  }
  return SERVER_MESSAGE;
}

function readFieldErrors(body: ApiErrorBody): Record<string, string> {
  if (typeof body.errors !== "object" || body.errors === null) return {};
  return Object.fromEntries(
    Object.entries(body.errors as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

interface ApiRequest extends Omit<RequestInit, "body"> {
  /** Serialised as the JSON body; sets the method to POST unless given one. */
  json?: unknown;
}

/**
 * Calls the API with the session cookie attached.
 *
 * `credentials: "include"` is what makes the cross-origin cookie flow work:
 * the storefront runs on :3000 and the API on :4000, so without it the browser
 * neither sends the session cookie nor stores the one login returns. The API's
 * CORS config names this origin explicitly — a wildcard is not allowed with
 * credentials.
 */
export async function apiFetch<T>(
  path: string,
  { json, ...init }: ApiRequest = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${SITE.apiUrl}${path}`, {
      ...init,
      method: init.method ?? (json === undefined ? "GET" : "POST"),
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(json === undefined
          ? {}
          : { "Content-Type": "application/json" as const }),
        ...init.headers,
      },
      ...(json === undefined ? {} : { body: JSON.stringify(json) }),
    });
  } catch (error) {
    // An abort is a caller's own doing (React Query cancelling a query, a
    // component unmounting), not a failure to report as one.
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    // fetch only rejects for transport failures — DNS, TLS, CORS, offline.
    throw new ApiError(0, NETWORK_MESSAGE);
  }

  if (response.status === 204) return undefined as T;

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody: ApiErrorBody =
      typeof body === "object" && body !== null ? body : {};
    throw new ApiError(
      response.status,
      readMessage(errorBody, response.status),
      readFieldErrors(errorBody),
    );
  }

  return body as T;
}
