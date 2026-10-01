"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { controlClasses, Field, type FieldProps, useField } from "./field";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type">, FieldProps {}

export function PasswordInput({
  label,
  hideLabel,
  hint,
  error,
  className,
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
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
        <input
          {...controlProps}
          type={visible ? "text" : "password"}
          className={controlClasses(
            "h-control rounded-pill py-0 pr-14 pl-6",
            error,
            className,
          )}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-2 grid w-10 place-items-center rounded-pill text-muted transition-colors hover:text-text"
        >
          {visible ? (
            <EyeOff size={18} strokeWidth={2.5} aria-hidden />
          ) : (
            <Eye size={18} strokeWidth={2.5} aria-hidden />
          )}
        </button>
      </div>
    </Field>
  );
}
