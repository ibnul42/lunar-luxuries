import { useId } from "react";

import { cn } from "@/lib/utils";

export interface Choice {
  value: string;
  label: string;
  /** Unavailable options stay visible but can't be picked. */
  disabled?: boolean;
  /** Swatch fill for `variant="swatch"` — product data, so an inline style. */
  color?: string | null;
}

export interface ChoiceGroupProps {
  /** Visible group label, e.g. "Size" or "Glaze — Sand". */
  legend: React.ReactNode;
  name: string;
  choices: readonly Choice[];
  value: string;
  onChange: (value: string) => void;
  variant?: "pill" | "swatch";
  className?: string;
}

/**
 * Size pills and colour swatches as a native radio group: arrow keys move
 * the selection, Tab enters and leaves the group as one stop, and screen
 * readers announce "radio, 2 of 3". The inputs are visually hidden and the
 * pill/swatch is their label (README §2 a11y note 5).
 */
export function ChoiceGroup({
  legend,
  name,
  choices,
  value,
  onChange,
  variant = "pill",
  className,
}: ChoiceGroupProps) {
  const groupId = useId();

  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="mb-3 text-[13px] font-semibold text-text">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2.5">
        {choices.map((choice) => {
          const id = `${groupId}-${choice.value}`;
          return (
            <div key={choice.value} className="relative">
              <input
                id={id}
                type="radio"
                name={`${groupId}-${name}`}
                value={choice.value}
                checked={value === choice.value}
                disabled={choice.disabled}
                onChange={() => onChange(choice.value)}
                className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
              {variant === "pill" ? (
                <label
                  htmlFor={id}
                  className={cn(
                    "pointer-events-none flex h-11 min-w-16 items-center justify-center rounded-pill border px-5 text-sm font-semibold transition-colors",
                    "border-border-strong text-text peer-hover:border-text",
                    "peer-checked:border-text peer-checked:bg-text peer-checked:text-bg",
                    "peer-disabled:border-dashed peer-disabled:text-muted peer-disabled:line-through",
                    // The input is invisible, so its focus ring goes on the label.
                    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-500",
                  )}
                >
                  {choice.label}
                </label>
              ) : (
                <label
                  htmlFor={id}
                  title={choice.label}
                  className={cn(
                    "pointer-events-none block size-9 rounded-pill ring-1 ring-border-strong transition-shadow",
                    "peer-checked:ring-2 peer-checked:ring-accent-500 peer-checked:ring-offset-2 peer-checked:ring-offset-bg",
                    "peer-disabled:opacity-40",
                    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent-500",
                  )}
                  style={{ backgroundColor: choice.color ?? undefined }}
                >
                  <span className="sr-only">{choice.label}</span>
                </label>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
