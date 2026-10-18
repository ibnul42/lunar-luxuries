"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";

import type { CategoryNode } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * The hero's "Shop by category" rail with its subcategory flyout.
 *
 * The prototype opens the flyout on `mouseenter` only, which no keyboard or
 * touch user can reach (README §2 a11y note 2). Here each category is a
 * button that toggles its flyout on click, Enter or Space; hovering with a
 * mouse still previews it, as a convenience on top. Escape closes and returns
 * focus; leaving the rail or pressing outside dismisses it.
 */
export function CategoryRail({ categories }: { categories: CategoryNode[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const flyoutId = useId();
  const open = categories.find((c) => c.slug === openSlug) ?? null;

  useEffect(() => {
    if (!openSlug) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      railRef.current
        ?.querySelector<HTMLButtonElement>(`[data-slug="${openSlug}"]`)
        ?.focus();
      setOpenSlug(null);
    }
    function onPointerDown(event: PointerEvent) {
      if (!railRef.current?.contains(event.target as Node)) setOpenSlug(null);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openSlug]);

  function show(slug: string, row: HTMLElement) {
    setFlyoutTop(row.offsetTop);
    setOpenSlug(slug);
  }

  return (
    <div
      ref={railRef}
      onMouseLeave={() => setOpenSlug(null)}
      className="relative z-10 hidden shrink-0 lg:flex"
    >
      <nav
        aria-label="Shop by category"
        className="w-hero-rail overflow-y-auto bg-surface/98 py-2.5 shadow-card"
      >
        <p className="px-6 pt-6 pb-4 font-display text-[13px] tracking-[0.08em] text-muted uppercase">
          Shop by category
        </p>
        <Link
          href="/shop"
          onMouseEnter={() => setOpenSlug(null)}
          className="flex items-center gap-3.5 border-t border-l-3 border-border border-l-transparent py-4 pr-5 pl-4.5 text-sm text-text transition-colors hover:bg-accent-100/60"
        >
          <LayoutGrid size={18} strokeWidth={2.5} aria-hidden />
          All products
        </Link>
        <ul>
          {categories.map((category) => {
            const active = category.slug === openSlug;
            const hasChildren = category.children.length > 0;
            return (
              <li key={category.slug}>
                {hasChildren ? (
                  <button
                    type="button"
                    data-slug={category.slug}
                    aria-expanded={active}
                    aria-controls={active ? flyoutId : undefined}
                    onClick={(event) =>
                      active
                        ? setOpenSlug(null)
                        : show(category.slug, event.currentTarget)
                    }
                    onMouseEnter={(event) =>
                      show(category.slug, event.currentTarget)
                    }
                    className={cn(
                      "flex w-full items-center gap-3.5 border-t border-l-3 border-border py-4 pr-5 pl-4.5 text-left text-sm font-medium transition-colors",
                      active
                        ? "border-l-accent-500 bg-accent-100/60 text-accent-800"
                        : "border-l-transparent text-text hover:bg-accent-100/60",
                    )}
                  >
                    <span className="flex-1">{category.name}</span>
                    <ChevronRight
                      size={16}
                      strokeWidth={2.75}
                      aria-hidden
                      className={active ? "text-accent-700" : "text-muted"}
                    />
                  </button>
                ) : (
                  <Link
                    href={`/shop?category=${category.slug}`}
                    onMouseEnter={() => setOpenSlug(null)}
                    className="flex items-center gap-3.5 border-t border-l-3 border-border border-l-transparent py-4 pr-5 pl-4.5 text-sm font-medium text-text transition-colors hover:bg-accent-100/60"
                  >
                    {category.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {open ? (
        <div
          id={flyoutId}
          style={{ top: flyoutTop }}
          className="absolute left-full ml-2.5 max-h-85 w-hero-flyout overflow-y-auto rounded-card bg-surface/98 px-6.5 py-7 shadow-card"
        >
          <p className="mb-2 font-display text-[16px] text-text">{open.name}</p>
          <span aria-hidden className="mb-5 block h-0.5 w-6 bg-accent-500" />
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                href={`/shop?category=${open.slug}`}
                className="text-[13.5px] font-semibold text-accent-700 hover:text-accent-800"
              >
                All {open.name}
              </Link>
            </li>
            {open.children.map((child) => (
              <li key={child.slug}>
                <Link
                  href={`/shop?category=${child.slug}`}
                  className="text-[13.5px] text-text-secondary transition-colors hover:text-accent-800"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
