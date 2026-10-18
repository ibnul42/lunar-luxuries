import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** 700-on-100/200, the same pairing StatusPill uses, so every tone clears 4.5:1. */
const TONES = {
  accent: "bg-accent-100 text-accent-800",
  sage: "bg-sage-200 text-sage-800",
  neutral: "bg-black/8 text-text/80",
  /** Over a photo: a light chip that reads on any image. */
  overlay: "bg-surface/90 text-text",
} as const;

export interface TagProps {
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}

/** A small label — "New", "Save 20%", "Sold out", "Default". Not interactive. */
export function Tag({ tone = "accent", children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
