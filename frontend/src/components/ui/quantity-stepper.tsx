"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max: number;
  /** Names the group, e.g. "Quantity of Ceramic Pour-Over Set". */
  label: string;
  disabled?: boolean;
  size?: "md" | "sm";
  className?: string;
}

/**
 * Two real buttons around the value. The value is an `<output>` with a polite
 * live region, so pressing + announces the new quantity. The prototype's
 * version is two `<div onClick>`s (README §2 a11y note 5).
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  label,
  disabled = false,
  size = "md",
  className,
}: QuantityStepperProps) {
  const button = cn(
    "grid h-full place-items-center rounded-pill text-text transition-colors",
    "hover:bg-accent-100 disabled:pointer-events-none disabled:opacity-40",
    size === "md" ? "w-11" : "w-9",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-pill border border-border-strong bg-surface",
        size === "md" ? "h-control" : "h-10",
        className,
      )}
    >
      <button
        type="button"
        className={button}
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={16} strokeWidth={2.75} aria-hidden />
      </button>
      <output
        aria-live="polite"
        className={cn(
          "text-center font-semibold tabular-nums",
          size === "md" ? "w-8 text-[15px]" : "w-7 text-sm",
        )}
      >
        {value}
      </output>
      <button
        type="button"
        className={button}
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={16} strokeWidth={2.75} aria-hidden />
      </button>
    </div>
  );
}
