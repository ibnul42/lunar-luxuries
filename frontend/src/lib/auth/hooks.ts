"use client";

import { useEffect } from "react";
import {
  type QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { fetchSession, login, logout, register, type SessionUser } from "./api";
import { useSessionStore } from "./store";

export const sessionQueryKey = ["auth", "session"] as const;

export const sessionQueryOptions = queryOptions({
  queryKey: sessionQueryKey,
  queryFn: ({ signal }) => fetchSession(signal),
  // Refetching on window focus (the default) is what catches a session that
  // expired, or was signed out in another tab, while this one sat idle.
  staleTime: 5 * 60 * 1000,
});

/**
 * Writes the session into the query cache; `useSessionQuery` copies it on into
 * the store from there, so there is one path in and the two cannot disagree.
 */
function applySession(
  queryClient: QueryClient,
  user: SessionUser | null,
): void {
  // Cancel first: an in-flight `/auth/me` would otherwise resolve afterwards
  // with the pre-login answer and overwrite this.
  void queryClient.cancelQueries({ queryKey: sessionQueryKey });
  queryClient.setQueryData(sessionQueryKey, user);
}

/**
 * Loads the session once per page load and keeps the store in step with it.
 * Mount exactly one of these, high in the tree (see `app/providers.tsx`).
 */
export function useSessionQuery(): void {
  const { data, isError } = useQuery(sessionQueryOptions);
  const setUser = useSessionStore((state) => state.setUser);

  useEffect(() => {
    if (data !== undefined) setUser(data);
    // A failed check leaves the header stuck in its loading state otherwise;
    // treat "can't tell" as signed out and let the next refetch correct it.
    else if (isError) setUser(null);
  }, [data, isError, setUser]);
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      applySession(queryClient, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: (user) => {
      applySession(queryClient, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Order matters. Mark the session gone first: a blanket `removeQueries()`
      // would delete the very query `useSessionQuery` is observing, and the
      // observer's result would still hold the old user, so the store would
      // never hear about the sign-out and the header would stay signed in.
      applySession(queryClient, null);
      // Then drop what was fetched as the outgoing user — orders, wishlist,
      // addresses once they exist — so the next sign-in cannot read them.
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== sessionQueryKey[0],
      });
    },
  });
}
