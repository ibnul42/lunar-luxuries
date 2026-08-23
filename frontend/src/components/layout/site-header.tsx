"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Heart, Search, ShoppingBag, User } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CATEGORIES, PRIMARY_NAV, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const ICON = { size: 20, strokeWidth: 2.75 } as const;

/** Icon-only actions on the right of the bar. Labels are the accessible names. */
const ACTIONS = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account", label: "Account", icon: User },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
] as const;

const NAV_LINK =
  "py-2 text-[15px] font-semibold text-text transition-colors hover:text-accent-700";

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
        className={cn("flex items-center gap-1.5", NAV_LINK)}
      >
        Shop
        <ChevronDown
          size={16}
          strokeWidth={2.75}
          className={cn("transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <Card
        id={panelId}
        hidden={!open}
        className="absolute top-full left-0 z-50 mt-3 w-64 p-3"
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
      </Card>
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
            <Link key={item.label} href={item.href} className={NAV_LINK}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={buttonClasses({ variant: "quiet", size: "icon" })}
            >
              <Icon {...ICON} aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
