import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { controlClasses, Field, type FieldProps, useField } from "./field";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>, FieldProps {
  options: readonly SelectOption[];
  /** 14px-radius admin control instead of the storefront pill. */
  shape?: "pill" | "admin";
}

/**
 * A real `<select>` under `appearance-none`, so the platform keeps doing the
 * hard parts — keyboard, type-ahead, the native picker on phones — and only
 * the closed control is restyled.
 */
export function Select({
  label,
  hideLabel,
  hint,
  error,
  options,
  shape = "pill",
  className,
  id,
  ...props
}: SelectProps) {
  const { controlId, controlProps } = useField({ id, hint, error });

  return (
    <Field
      controlId={controlId}
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
    >
      <div className="relative">
        <select
          {...controlProps}
          className={controlClasses(
            cn(
              "cursor-pointer appearance-none pr-12",
              shape === "pill"
                ? "h-control rounded-pill pl-6"
                : "h-control-admin rounded-nav pl-4 text-sm",
            ),
            error,
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2.75}
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-muted"
        />
      </div>
    </Field>
  );
}
