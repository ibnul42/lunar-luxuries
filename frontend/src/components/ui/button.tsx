import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "quiet" | "sage" | "danger";
export type ButtonSize = "sm" | "md" | "admin" | "icon";

/**
 * Contrast note — the design specifies a #c67139 (accent-500) fill with a white
 * label, which measures 3.61:1 and fails WCAG AA for normal text. `primary`
 * therefore fills with accent-600 (4.90:1). It reads as the same terracotta but
 * survives an audit. README §2 a11y note 1.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-600 text-white shadow-button hover:bg-accent-700 active:bg-accent-900",
  secondary:
    "bg-surface text-text border border-border-strong hover:bg-accent-100 active:bg-accent-200",
  ghost: "text-accent-700 hover:bg-accent-100 active:bg-accent-200",
  /** Chrome that must not compete with the page — header icons, toolbars. */
  quiet: "text-text hover:bg-accent-100 active:bg-accent-200",
  sage: "bg-sage-700 text-white hover:bg-sage-800 active:bg-sage-900",
  danger: "bg-danger text-white hover:brightness-90 active:brightness-75",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-control px-8 text-[15px]",
  admin: "h-control-admin px-6 text-sm",
  icon: "size-control-admin p-0",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-pill font-semibold",
    "transition-colors duration-150 select-none",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}
