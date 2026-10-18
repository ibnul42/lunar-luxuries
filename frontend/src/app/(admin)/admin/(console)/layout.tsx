import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminConsoleLayout({
  children,
}: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
