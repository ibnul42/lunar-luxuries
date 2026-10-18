import type { InputHTMLAttributes } from "react";

import { controlClasses, Field, type FieldProps, useField } from "./field";

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>, FieldProps {
  /** 14px-radius, 44px admin control instead of the storefront pill. */
  shape?: "pill" | "admin";
}

export function Input({
  label,
  hideLabel,
  hint,
  error,
  shape = "pill",
  className,
  id,
  ...props
}: InputProps) {
  const { controlId, controlProps } = useField({ id, hint, error });

  return (
    <Field
      controlId={controlId}
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
    >
      <input
        {...controlProps}
        className={controlClasses(
          shape === "pill"
            ? "h-control rounded-pill px-6"
            : "h-control-admin rounded-nav px-4 text-sm",
          error,
          className,
        )}
        {...props}
      />
    </Field>
  );
}
