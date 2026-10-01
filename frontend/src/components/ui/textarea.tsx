import type { TextareaHTMLAttributes } from "react";

import { controlClasses, Field, type FieldProps, useField } from "./field";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}

/**
 * The pill input's multi-line sibling. A 999px radius turns a tall box into a
 * lozenge, so it takes the card radius instead — the design does the same.
 */
export function Textarea({
  label,
  hideLabel,
  hint,
  error,
  className,
  id,
  rows = 5,
  ...props
}: TextareaProps) {
  const { controlId, controlProps } = useField({ id, hint, error });

  return (
    <Field
      controlId={controlId}
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
    >
      <textarea
        {...controlProps}
        rows={rows}
        className={controlClasses(
          "min-h-32 resize-y rounded-card px-6 py-4 leading-relaxed",
          error,
          className,
        )}
        {...props}
      />
    </Field>
  );
}
