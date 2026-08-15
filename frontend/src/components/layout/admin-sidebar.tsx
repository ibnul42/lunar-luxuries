"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderTree,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Users,
} from "lucide-react";

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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-8 border-r border-border bg-surface px-5 py-8">
      <Link href="/admin" className="px-3 font-display text-wordmark text-text">
        {SITE.name}
      </Link>

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
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-control-admin items-center gap-3 rounded-nav px-3 text-sm font-semibold transition-colors",
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
    </aside>
  );
}
