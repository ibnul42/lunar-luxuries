"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api";
import { useSessionQuery } from "@/lib/auth/hooks";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          // 4xx means the request was understood and refused — a validation
          // error, a missing row, a signed-out visitor. Retrying changes
          // nothing. Transport failures (status 0) and 5xx get one more go.
          if (error instanceof ApiError && error.status >= 400) return false;
          return failureCount < 1;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  // A fresh client per server render keeps one request's data out of another's.
  if (isServer) return makeQueryClient();
  // In the browser, one client for the tab's whole life — and created outside
  // render, so a suspending first render cannot throw the cache away.
  return (browserQueryClient ??= makeQueryClient());
}

function SessionLoader() {
  useSessionQuery();
  return null;
}

/**
 * Client boundary at the root. `children` stays server-rendered: it arrives as
 * an already-rendered tree, so pages and layouts below are still server
 * components.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <SessionLoader />
      {children}
    </QueryClientProvider>
  );
}
