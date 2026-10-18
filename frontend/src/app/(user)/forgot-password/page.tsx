import { AuthCard } from "@/components/layout/auth-card";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
