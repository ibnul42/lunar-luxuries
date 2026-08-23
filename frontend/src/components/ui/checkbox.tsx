import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Rich content is allowed — the Terms box links out mid-sentence. */
  label: ReactNode;
  error?: string;
}

/**
 * Browsers paint a native checkbox themselves and ignore `border` and
 * `border-radius` on it, so the box is drawn here with `appearance-none` and
 * the tick is a sibling revealed by `peer-checked`. The control stays a real
 * `input[type=checkbox]`, so form submission, `required` and the global
 * `:focus-visible` ring all work unchanged. README §2 a11y note 5.
 */
export function Checkbox({
  label,
  error,
  className,
  id,
  ...props
}: CheckboxProps) {
  const reactId = useId();
  const fieldId = id ?? reactId;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="flex items-start gap-2.5 text-[13px] font-medium text-text select-none"
      >
        <span className="relative grid shrink-0 place-items-center">
          <input
            id={fieldId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={cn(
              "peer size-4.5 appearance-none rounded-check border bg-input transition-colors",
              "border-border-strong hover:border-accent-600",
              "checked:border-accent-600 checked:bg-accent-600",
              error && "border-danger",
              className,
            )}
            {...props}
          />
          <Check
            size={12}
            strokeWidth={3.5}
            aria-hidden
            className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100"
          />
        </span>
        {label}
      </label>

      {error ? (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="pl-7 text-[13px] text-danger"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
