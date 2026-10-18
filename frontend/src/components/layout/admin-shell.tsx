"use client";

import { type ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionStatus } from "@/lib/auth/store";
import { useIsStaff } from "@/lib/admin";

import { AdminSidebar } from "./admin-sidebar";

/**
 * The console frame plus its gate. Signed out → /admin/login. Signed in as a
 * customer → a refusal, not a redirect loop. This is the UI half only: every
 * admin route on the API is behind `AdminGuard`, so nothing here is what keeps
 * data safe (README §8).
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const status = useSessionStatus();
  const isStaff = useIsStaff();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  let content: ReactNode;
  if (status === "authenticated" && isStaff) {
    content = children;
  } else if (status === "authenticated") {
    content = (
      <EmptyState
        icon={ShieldAlert}
        title="No access to the admin console"
        action={
          <Link href="/" className={buttonClasses()}>
            Back to the store
          </Link>
        }
      >
        You&rsquo;re signed in with a customer account. Sign out and back in
        with a staff account to manage the store.
      </EmptyState>
    );
  } else {
    content = (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main
        id="main"
        className="min-w-0 flex-1 bg-bg px-5 py-8 sm:px-8 lg:px-11 lg:py-9"
      >
        {content}
      </main>
    </div>
  );
}
