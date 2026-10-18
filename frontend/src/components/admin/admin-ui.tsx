import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { controlClasses } from "@/components/ui/field";
import { WashedImage } from "@/components/ui/washed-image";
import { cn } from "@/lib/utils";

/** Title row of every console page: heading, optional subline and actions. */
export function AdminPageHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 space-y-4">
      {back ? (
        <Link
          href={back.href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent-700 hover:text-accent-800"
        >
          <ArrowLeft size={16} strokeWidth={2.75} aria-hidden />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-[28px] leading-tight">{title}</h1>
          {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

/** The design's admin content card: surface, 24px radius, flat shadow. */
export function AdminPanel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card elevation="panel" className={cn("min-w-0 p-5 sm:p-6", className)}>
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </Card>
  );
}

/**
 * Admin tables scroll sideways inside their panel on narrow screens rather
 * than squeezing columns — the design is desktop-only (README §10 q2).
 */
export function AdminTable({
  label,
  head,
  children,
}: {
  label: string;
  head: readonly string[];
  children: ReactNode;
}) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
      <table className="w-full min-w-160 border-collapse text-[13px]">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            {head.map((cell, index) => (
              <th
                key={cell || index}
                scope="col"
                className="border-b border-border pb-3 text-left text-[11px] font-semibold tracking-[0.06em] text-muted uppercase last:text-right"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:py-3.5 [&_td]:pr-4 [&_td:last-child]:pr-0 [&_td:last-child]:text-right [&>tr]:border-b [&>tr]:border-border [&>tr:last-child]:border-0">
          {children}
        </tbody>
      </table>
    </div>
  );
}

/** Live-filtering search box for list pages. */
export function AdminSearch({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <label className="sr-only" htmlFor="admin-search">
        {label}
      </label>
      <Search
        size={16}
        strokeWidth={2.75}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
      />
      <input
        id="admin-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={controlClasses(
          "h-control-admin rounded-nav pr-4 pl-10 text-sm",
        )}
      />
    </div>
  );
}

/** Product thumbnail in admin lists — a placeholder until media exists. */
export function Thumb({
  src,
  className,
}: {
  src?: string | null;
  className?: string;
}) {
  return (
    <WashedImage
      src={src}
      alt=""
      sizes="48px"
      className={cn("size-11 shrink-0 rounded-thumb", className)}
    />
  );
}
