"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string;
}

export function PasswordInput({
  label,
  hideLabel = false,
  hint,
  error,
  className,
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
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

      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-control w-full rounded-pill bg-input py-0 pr-14 pl-6 text-[15px] text-text",
            "placeholder:text-muted",
            "border border-transparent transition-colors",
            "hover:border-border-strong",
            error && "border-danger",
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
