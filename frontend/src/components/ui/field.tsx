import type { ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/utils";

/** The props every labelled form control shares. */
export interface FieldProps {
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string;
}

/**
 * Ids and ARIA wiring for one control. The control spreads `controlProps`;
 * `<Field>` renders the label, hint and error against the same `id`, so the
 * two cannot disagree.
 */
export function useField({
  id,
  hint,
  error,
}: {
  id?: string;
  hint?: ReactNode;
  error?: string;
}) {
  const reactId = useId();
  const controlId = id ?? reactId;
  const describedBy = error
    ? `${controlId}-error`
    : hint
      ? `${controlId}-hint`
      : undefined;

  return {
    controlId,
    controlProps: {
      id: controlId,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy,
    },
  } as const;
}

/** Fill, border and hover shared by the pill input and the textarea. */
export function controlClasses(
  shape: string,
  error?: string,
  className?: string,
) {
  return cn(
    "w-full border border-transparent bg-input text-[15px] text-text transition-colors",
    "placeholder:text-muted hover:border-border-strong",
    shape,
    error && "border-danger",
    className,
  );
}

export function Field({
  controlId,
  label,
  hideLabel = false,
  hint,
  error,
  children,
}: FieldProps & { controlId: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={controlId}
        className={cn(
          "text-[13px] font-semibold text-text",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>

      {children}

      {error ? (
        <p id={`${controlId}-error`} className="px-6 text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${controlId}-hint`} className="px-6 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
