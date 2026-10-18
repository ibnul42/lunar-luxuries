import { Card } from "@/components/ui/card";
import { SITE } from "@/lib/site";

import { AdminLoginForm } from "./admin-login-form";

export const metadata = {
  title: "Sign in",
};

/** The Admin Login design: a centred card, no sidebar. */
export default function AdminLoginPage() {
  return (
    <main
      id="main"
      className="flex min-h-screen items-center justify-center bg-bg px-5 py-12"
    >
      <Card elevation="panel" className="w-full max-w-md px-6 py-10 sm:px-10">
        <div className="mb-8 text-center">
          <p className="font-display text-wordmark">{SITE.name}</p>
          <p className="mt-2 text-[11px] font-semibold tracking-[0.12em] text-accent-700 uppercase">
            Admin console
          </p>
          <h1 className="mt-6 font-display text-2xl">Sign in</h1>
        </div>
        <AdminLoginForm />
      </Card>
    </main>
  );
}
