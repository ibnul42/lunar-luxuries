import { AdminSidebar } from "@/components/layout/admin-sidebar";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Admin shell — sidebar + content well.
 *
 * TODO (Phase 1): role-gate this layout. Every route below it must require a
 * STAFF/ADMIN session, and every query must be row-level authorized rather than
 * trusting an ID from the URL (README §8).
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main id="main" className="flex-1 bg-bg px-10 py-10">
        {children}
      </main>
    </div>
  );
}
