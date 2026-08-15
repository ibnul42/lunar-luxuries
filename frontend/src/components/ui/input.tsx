import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Visually hide the label but keep it for assistive tech. */
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string;
}

/**
 * Pill input. The focus ring comes from the global `:focus-visible` rule in
 * globals.css — do not add `outline-none` here.
 */
export function Input({
  label,
  hideLabel = false,
  hint,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className={cn(
          "text-[13px] font-semibold text-text",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-control w-full rounded-pill bg-input px-6 text-[15px] text-text",
          "placeholder:text-muted",
          "border border-transparent transition-colors",
          "hover:border-border-strong",
          error && "border-danger",
          className,
        )}
        {...props}
      />

      {error ? (
        <p id={`${inputId}-error`} className="px-6 text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="px-6 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
