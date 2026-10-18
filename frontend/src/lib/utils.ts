import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { SITE } from "@/lib/site";

/** Conditional classes with later Tailwind utilities winning conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Jul 28, 2026". `month: "long"` for "July 2026"-style headings. */
export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
}

/** Taka (or any 2-decimal currency) typed in a form → minor units. */
export function toMinorUnits(major: string): number | null {
  const value = Number(major.replace(/[,\s]/g, ""));
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

/** Minor units → a plain number string for a form field ("6500" / "65.50"). */
export function fromMinorUnits(minor: number): string {
  return minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2);
}

export function formatPrice(
  minorUnits: number,
  currency: string = SITE.currency,
  locale: string = SITE.locale,
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(minorUnits / 100);
}
