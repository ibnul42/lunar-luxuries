import { ApiError, apiFetch } from "@/lib/api";

export type Role = "CUSTOMER" | "STAFF" | "ADMIN";

/**
 * Mirrors `publicUserSelect` in backend/src/auth/public-user.ts. Dates cross
 * the wire as ISO strings, so they stay strings here.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerifiedAt: string | null;
  createdAt: string;
}

interface UserResponse {
  user: SessionUser;
}

export interface LoginInput {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

/** `null` when nobody is signed in — being signed out is an answer, not an error. */
export async function fetchSession(
  signal?: AbortSignal,
): Promise<SessionUser | null> {
  try {
    const { user } = await apiFetch<UserResponse>("/auth/me", { signal });
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/** The API sets the httpOnly session cookie; nothing here touches a token. */
export async function login(input: LoginInput): Promise<SessionUser> {
  const { user } = await apiFetch<UserResponse>("/auth/login", { json: input });
  return user;
}

/** Registration signs the new account straight in. */
export async function register(input: RegisterInput): Promise<SessionUser> {
  const { user } = await apiFetch<UserResponse>("/auth/register", {
    json: input,
  });
  return user;
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" });
}
