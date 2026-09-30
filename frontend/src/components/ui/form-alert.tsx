import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A whole-form message — "Incorrect email or password", a rate limit, an
 * unreachable API. Field-level problems belong on the field instead, through
 * the `error` prop the form primitives already wire up.
 *
 * `role="alert"` makes a screen reader announce it when it appears after a
 * failed submit, which is the only way it ever shows up.
 */
export function FormAlert({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-card border border-danger/25 bg-danger/8 px-5 py-3 text-[13px] text-danger",
        className,
      )}
    >
      {children}
    </p>
  );
}
