"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, LogOut, MapPin, Package, UserRound } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useLogout } from "@/lib/auth/hooks";
import { useSessionUser } from "@/lib/auth/store";
import { useRequireSession } from "@/lib/use-require-session";
import { cn } from "@/lib/utils";

import { AddressesPanel } from "./addresses-panel";
import { OrdersPanel } from "./orders-panel";
import { ProfilePanel } from "./profile-panel";

const SECTIONS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "profile", label: "Profile settings", icon: UserRound },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

const NAV_ITEM =
  "flex h-11 shrink-0 items-center gap-3 rounded-nav px-4 text-[15px] font-semibold whitespace-nowrap transition-colors";

/**
 * The section lives in `?tab=`, so each is linkable ("Orders" in the header
 * menu goes straight there) and Back works between them. The design's aside
 * becomes a scrolling strip of the same links on phones.
 */
export function AccountView() {
  const status = useRequireSession();
  const user = useSessionUser();
  const logout = useLogout();
  const params = useSearchParams();
  const requested = params.get("tab");
  const active: SectionId = SECTIONS.some((s) => s.id === requested)
    ? (requested as SectionId)
    : "orders";

  if (status !== "authenticated" || !user) {
    return (
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <Skeleton className="h-48" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <>
      <p className="-mt-6 mb-8 text-[15px] text-muted lg:mb-10">
        Welcome back, {user.name.split(" ")[0]}.
      </p>

      <div className="grid items-start gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <nav
          aria-label="Account"
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:sticky lg:top-[calc(var(--spacing-header)+24px)] lg:flex-col lg:overflow-visible"
        >
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`/account?tab=${id}`}
              scroll={false}
              aria-current={active === id ? "page" : undefined}
              className={cn(
                NAV_ITEM,
                active === id
                  ? "bg-accent-100 text-accent-800"
                  : "text-text hover:bg-accent-100/60",
              )}
            >
              <Icon size={18} strokeWidth={2.5} aria-hidden />
              {label}
            </Link>
          ))}
          <Link
            href="/wishlist"
            className={cn(NAV_ITEM, "text-text hover:bg-accent-100/60")}
          >
            <Heart size={18} strokeWidth={2.5} aria-hidden />
            Wishlist
          </Link>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className={cn(NAV_ITEM, "text-text hover:bg-accent-100/60")}
          >
            <LogOut size={18} strokeWidth={2.5} aria-hidden />
            {logout.isPending ? "Signing out…" : "Sign out"}
          </button>
        </nav>

        <section aria-label={SECTIONS.find((s) => s.id === active)?.label}>
          {active === "orders" ? <OrdersPanel /> : null}
          {active === "addresses" ? <AddressesPanel /> : null}
          {active === "profile" ? <ProfilePanel user={user} /> : null}
        </section>
      </div>
    </>
  );
}
