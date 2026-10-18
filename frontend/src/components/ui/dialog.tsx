"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** `sheet` slides in from the side — the mobile menu and shop filters. */
  variant?: "center" | "sheet";
  className?: string;
}

/**
 * Native `<dialog>` opened with `showModal()`: the browser supplies the focus
 * trap, inert background, Escape-to-close and top-layer stacking, and returns
 * focus to the trigger when it closes. This component only syncs `open` with
 * it and draws the panel.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  variant = "center",
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock page scroll behind the modal, the way the platform does not.
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape fires `cancel`, then `close`; `close` covers both paths.
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> itself, not its panel.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 text-text backdrop:bg-overlay",
        variant === "center"
          ? "inset-0 m-auto w-[min(100%-2rem,32rem)]"
          : "inset-y-0 right-0 left-auto h-dvh w-[min(100%-3rem,24rem)]",
      )}
    >
      <div
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] flex-col bg-surface shadow-card",
          variant === "center" ? "rounded-panel" : "h-full max-h-none",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 sm:px-8">
          <div className="space-y-1">
            <h2 id={titleId} className="font-display text-xl text-text">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-[14px] text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-pill text-text transition-colors hover:bg-accent-100"
          >
            <X size={20} strokeWidth={2.75} aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-8 sm:px-8">{children}</div>
      </div>
    </dialog>
  );
}
