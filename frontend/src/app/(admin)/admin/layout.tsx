export const metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

/**
 * Everything under /admin is unindexed. The console itself (sidebar, role
 * gate) lives in the `(console)` group; /admin/login sits outside it.
 */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
