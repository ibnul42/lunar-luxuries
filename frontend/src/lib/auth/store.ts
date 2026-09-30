import { create } from "zustand";

import type { SessionUser } from "./api";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
}

/**
 * Who is signed in, as client state.
 *
 * The split with React Query: React Query owns the *requests* — the `/auth/me`
 * fetch, its refetch on window focus, and the login/register/logout mutations
 * with their pending and error state. This store owns the *answer*, so any
 * component can read it synchronously through a selector (and re-render only
 * when its own slice changes) without each one subscribing to a query.
 *
 * `useSessionQuery` and the auth mutations are the only writers — see
 * `hooks.ts`. Nothing else should call `setUser`, or the two drift apart.
 *
 * Safe as a module singleton despite Next's server rendering: it is only ever
 * written in the browser (effects and mutation callbacks), so the copy on the
 * server stays empty and cannot leak one visitor's identity into another's
 * request.
 */
export const useSessionStore = create<SessionState>()((set) => ({
  status: "loading",
  user: null,
  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "anonymous" }),
}));

// Separate selectors rather than one returning `{ user, status }`: a selector
// that builds a new object on every call re-renders forever under zustand v5.
export const useSessionUser = (): SessionUser | null =>
  useSessionStore((state) => state.user);

export const useSessionStatus = (): SessionStatus =>
  useSessionStore((state) => state.status);
