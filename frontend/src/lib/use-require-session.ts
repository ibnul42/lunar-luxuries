"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSessionStatus } from "@/lib/auth/store";

/**
 * Sends a signed-out visitor to /login and back here afterwards. Returns the
 * session status so the page can show a skeleton while it is "loading".
 *
 * This is navigation, not security: every member route on the API is behind
 * `SessionGuard`, so a visitor who skips the redirect sees nothing anyway.
 */
export function useRequireSession(loginPath = "/login") {
  const status = useSessionStatus();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "anonymous") return;
    const next = pathname + window.location.search;
    router.replace(`${loginPath}?next=${encodeURIComponent(next)}`);
  }, [status, router, pathname, loginPath]);

  return status;
}
