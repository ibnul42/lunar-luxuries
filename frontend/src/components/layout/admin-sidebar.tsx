"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  Users,
} from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useLogout } from "@/lib/auth/hooks";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

const ITEM =
  "flex h-control-admin items-center gap-3 rounded-nav px-3 text-sm font-semibold transition-colors";

function Wordmark() {
  return (
    <Link href="/admin" className="block px-3">
      <span className="block font-display text-wordmark whitespace-nowrap text-text">
        {SITE.name}
      </span>
      <span className="mt-1.5 block text-[11px] font-semibold tracking-[0.12em] text-accent-700 uppercase">
        Admin
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <div className="flex flex-1 flex-col justify-between gap-8">
      <nav aria-label="Admin">
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon, ...item }) => {
            const exact = "exact" in item && item.exact;
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    ITEM,
                    active
                      ? "bg-accent-600 text-white"
                      : "text-text hover:bg-accent-100 hover:text-accent-800",
                  )}
                >
                  <Icon size={18} strokeWidth={2.25} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-border pt-4">
        <Link href="/" className={cn(ITEM, "text-text hover:bg-accent-100")}>
          <ExternalLink size={18} strokeWidth={2.25} aria-hidden />
          View store
        </Link>
        <button
          type="button"
          disabled={logout.isPending}
          onClick={() => {
            onNavigate?.();
            logout.mutate();
          }}
          className={cn(ITEM, "w-full text-text hover:bg-accent-100")}
        >
          <LogOut size={18} strokeWidth={2.25} aria-hidden />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

/**
 * Sticky sidebar from `lg`. Below it the console gets a top bar whose menu
 * opens the same links in a sheet — the design is desktop-only (README §10 q2).
 */
export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-sidebar shrink-0 flex-col gap-8 border-r border-border bg-surface px-5 py-8 lg:flex">
        <Wordmark />
        <NavLinks />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Wordmark />
        <button
          type="button"
          aria-label="Open admin menu"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className={buttonClasses({ variant: "quiet", size: "icon" })}
        >
          <Menu size={20} strokeWidth={2.75} aria-hidden />
        </button>
      </header>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Admin"
        variant="sheet"
      >
        <div className="flex min-h-[60vh] flex-col">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      </Dialog>
    </>
  );
}
