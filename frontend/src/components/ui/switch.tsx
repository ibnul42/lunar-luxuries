import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "role"
> {
  label: string;
  description?: ReactNode;
}

/**
 * An on/off toggle — Admin Settings' shipping and payment rows. A real
 * checkbox with `role="switch"`, so it submits with a form, Space toggles it
 * and assistive tech announces "on"/"off". The track and thumb are drawn from
 * the checkbox's own `:checked` state; no JavaScript involved.
 */
export function Switch({
  label,
  description,
  className,
  id,
  ...props
}: SwitchProps) {
  const reactId = useId();
  const controlId = id ?? reactId;

  return (
    <div className={cn("flex items-center justify-between gap-6", className)}>
      <label htmlFor={controlId} className="space-y-0.5">
        <span className="block text-sm font-semibold text-text">{label}</span>
        {description ? (
          <span
            id={`${controlId}-description`}
            className="block text-[13px] text-muted"
          >
            {description}
          </span>
        ) : null}
      </label>

      <span className="relative inline-flex shrink-0">
        <input
          id={controlId}
          type="checkbox"
          role="switch"
          aria-describedby={
            description ? `${controlId}-description` : undefined
          }
          className={cn(
            "peer h-7 w-12 cursor-pointer appearance-none rounded-pill bg-border-strong transition-colors",
            "checked:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-50",
          )}
          {...props}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 left-1 size-5 rounded-pill bg-white shadow-panel transition-transform peer-checked:translate-x-5"
        />
      </span>
    </div>
  );
}
