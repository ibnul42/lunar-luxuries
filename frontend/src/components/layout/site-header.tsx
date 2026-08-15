"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Heart, Search, ShoppingBag, User } from "lucide-react";

import { CATEGORIES, PRIMARY_NAV, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const ICON = { size: 20, strokeWidth: 2.75 } as const;

function ShopMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 py-2 text-[15px] font-semibold text-text transition-colors hover:text-accent-700"
      >
        Shop
        <ChevronDown
          size={16}
          strokeWidth={2.75}
          className={cn("transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full left-0 z-50 mt-3 w-64 rounded-card bg-surface p-3 shadow-card"
      >
        <ul>
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/shop?category=${category.slug}`}
                onClick={() => setOpen(false)}
                className="block rounded-nav px-4 py-2.5 text-[15px] text-text transition-colors hover:bg-accent-100 hover:text-accent-800"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="shell flex h-20 items-center justify-between gap-10">
        <Link
          href="/"
          className="font-display text-wordmark tracking-tight text-text"
        >
          {SITE.name}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <ShopMenu />
          {PRIMARY_NAV.filter((item) => item.label !== "Shop").map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="py-2 text-[15px] font-semibold text-text transition-colors hover:text-accent-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="grid size-11 place-items-center rounded-pill text-text transition-colors hover:bg-accent-100"
          >
            <Search {...ICON} aria-hidden />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="grid size-11 place-items-center rounded-pill text-text transition-colors hover:bg-accent-100"
          >
            <Heart {...ICON} aria-hidden />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="grid size-11 place-items-center rounded-pill text-text transition-colors hover:bg-accent-100"
          >
            <User {...ICON} aria-hidden />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="grid size-11 place-items-center rounded-pill text-text transition-colors hover:bg-accent-100"
          >
            <ShoppingBag {...ICON} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
