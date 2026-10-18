"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useLogout } from "@/lib/auth/hooks";
import { useSessionStatus, useSessionUser } from "@/lib/auth/store";
import { useCart } from "@/lib/cart";
import { PRIMARY_NAV, SITE } from "@/lib/site";
import { useDisclosure } from "@/lib/use-disclosure";
import { cn } from "@/lib/utils";

const ICON = { size: 20, strokeWidth: 2.75 } as const;

/** What the header needs from the category tree — see `(user)/layout.tsx`. */
export interface NavCategory {
  slug: string;
  name: string;
}

const NAV_LINK =
  "py-2 text-[15px] font-semibold text-text transition-colors hover:text-accent-700";

const MENU_ITEM =
  "block rounded-nav px-4 py-2.5 text-[15px] text-text transition-colors hover:bg-accent-100 hover:text-accent-800";

function ShopMenu({ categories }: { categories: readonly NavCategory[] }) {
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
          <li>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className={MENU_ITEM}
            >
              All products
            </Link>
          </li>
          {categories.map((category) => (
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
        <Link
          href="/account?tab=orders"
          onClick={() => setOpen(false)}
          className={MENU_ITEM}
        >
          Orders
        </Link>
        <Link
          href="/wishlist"
          onClick={() => setOpen(false)}
          className={MENU_ITEM}
        >
          Wishlist
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

function CartAction() {
  const { data } = useCart();
  const count = data?.itemCount ?? 0;

  return (
    <Link
      href="/cart"
      aria-label={
        count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"
      }
      className={cn(
        buttonClasses({ variant: "quiet", size: "icon" }),
        "relative",
      )}
    >
      <ShoppingBag {...ICON} aria-hidden />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-pill bg-accent-600 px-1 text-[11px] font-bold text-white tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Below `lg` the nav collapses into a sheet. The design has no mobile layout
 * (README §10 q2), so this is derived: every link the desktop bar and the
 * Shop menu offer, in one scrolling list.
 */
function MobileMenu({ categories }: { categories: readonly NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const status = useSessionStatus();
  const user = useSessionUser();
  const logout = useLogout();
  const close = () => setOpen(false);

  const link =
    "block rounded-nav px-3 py-3 text-[16px] font-semibold text-text hover:bg-accent-100";
  const sublink =
    "block rounded-nav px-3 py-2.5 text-[15px] text-text-secondary hover:bg-accent-100 hover:text-text";

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(
          buttonClasses({ variant: "quiet", size: "icon" }),
          "lg:hidden",
        )}
      >
        <Menu {...ICON} aria-hidden />
      </button>

      <Dialog open={open} onClose={close} title="Menu" variant="sheet">
        <nav aria-label="Mobile" className="space-y-6">
          <div>
            <p className="mb-2 px-3 kicker text-accent-700">Shop</p>
            <Link href="/shop" onClick={close} className={sublink}>
              All products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop?category=${category.slug}`}
                onClick={close}
                className={sublink}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            {PRIMARY_NAV.filter((item) => item.label !== "Shop").map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={close}
                className={link}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/wishlist" onClick={close} className={link}>
              Wishlist
            </Link>
            <Link href="/orders/track" onClick={close} className={link}>
              Track an order
            </Link>
          </div>

          <div className="border-t border-border pt-4">
            {status === "authenticated" && user ? (
              <>
                <p className="px-3 pb-2 text-[13px] text-muted">
                  Signed in as {user.name}
                </p>
                <Link href="/account" onClick={close} className={link}>
                  Your account
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    logout.mutate();
                  }}
                  className={cn(link, "w-full text-left")}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className={link}>
                  Sign in
                </Link>
                <Link href="/register" onClick={close} className={link}>
                  Create an account
                </Link>
              </>
            )}
          </div>
        </nav>
      </Dialog>
    </>
  );
}

export function SiteHeader({
  categories,
}: {
  categories: readonly NavCategory[];
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="shell flex h-header-mobile items-center justify-between gap-4 lg:h-header lg:gap-10">
        <div className="flex items-center gap-1">
          <MobileMenu categories={categories} />
          <Link
            href="/"
            className="font-display text-[18px] tracking-tight text-text sm:text-wordmark"
          >
            {SITE.name}
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <ShopMenu categories={categories} />
          {PRIMARY_NAV.filter((item) => item.label !== "Shop").map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                NAV_LINK,
                pathname === item.href && "border-b-2 border-accent-500",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className={buttonClasses({ variant: "quiet", size: "icon" })}
          >
            <Search {...ICON} aria-hidden />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className={cn(
              buttonClasses({ variant: "quiet", size: "icon" }),
              "hidden sm:inline-flex",
            )}
          >
            <Heart {...ICON} aria-hidden />
          </Link>
          <AccountAction />
          <CartAction />
        </div>
      </div>
    </header>
  );
}
