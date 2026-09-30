"use client";

import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LogOut,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLogout } from "@/lib/auth/hooks";
import { useSessionStatus, useSessionUser } from "@/lib/auth/store";
import { CATEGORIES, PRIMARY_NAV, SITE } from "@/lib/site";
import { useDisclosure } from "@/lib/use-disclosure";
import { cn } from "@/lib/utils";

const ICON = { size: 20, strokeWidth: 2.75 } as const;

/** Icon-only actions on the right of the bar. Labels are the accessible names. */
const ACTIONS = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
] as const;

const NAV_LINK =
  "py-2 text-[15px] font-semibold text-text transition-colors hover:text-accent-700";

const MENU_ITEM =
  "block rounded-nav px-4 py-2.5 text-[15px] text-text transition-colors hover:bg-accent-100 hover:text-accent-800";

function ShopMenu() {
  const { open, setOpen, panelId, wrapperRef, triggerRef } = useDisclosure();

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
                className={MENU_ITEM}
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

/**
 * The design has a plain account icon, which assumes a signed-in visitor and
 * offers no way back out. Signed out it goes to /login; signed in it opens a
 * menu, because sign-out has to live somewhere.
 */
function AccountAction() {
  const status = useSessionStatus();
  const user = useSessionUser();
  const logout = useLogout();
  const { open, setOpen, panelId, wrapperRef, triggerRef } = useDisclosure();

  if (status !== "authenticated" || !user) {
    return (
      <Link
        // While the session is still being fetched, keep the design's target:
        // it is right for a returning visitor and harmless for anyone else.
        href={status === "anonymous" ? "/login" : "/account"}
        aria-label="Account"
        className={buttonClasses({ variant: "quiet", size: "icon" })}
      >
        <User {...ICON} aria-hidden />
      </Link>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Account — signed in as ${user.name}`}
        onClick={() => setOpen((v) => !v)}
        className={buttonClasses({ variant: "quiet", size: "icon" })}
      >
        <User {...ICON} aria-hidden />
      </button>

      <Card
        id={panelId}
        hidden={!open}
        className="absolute top-full right-0 z-50 mt-3 w-64 p-3"
      >
        <div className="px-4 py-2">
          <p className="truncate text-[13px] font-semibold text-text">
            {user.name}
          </p>
          <p className="truncate text-[13px] text-muted">{user.email}</p>
        </div>

        <div className="my-2 h-px bg-border" aria-hidden />

        <Link
          href="/account"
          onClick={() => setOpen(false)}
          className={MENU_ITEM}
        >
          Your account
        </Link>

        <button
          type="button"
          disabled={logout.isPending}
          onClick={() => {
            setOpen(false);
            logout.mutate();
          }}
          className={cn(MENU_ITEM, "flex w-full items-center gap-2 text-left")}
        >
          <LogOut size={16} strokeWidth={2.75} aria-hidden />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </button>
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

          <AccountAction />

          <Link
            href="/cart"
            aria-label="Cart"
            className={buttonClasses({ variant: "quiet", size: "icon" })}
          >
            <ShoppingBag {...ICON} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
