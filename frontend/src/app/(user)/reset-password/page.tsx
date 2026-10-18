import { Suspense } from "react";

import { AuthCard } from "@/components/layout/auth-card";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Reset password",
  // The URL carries a live token; keep it out of indexes and Referer headers.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
