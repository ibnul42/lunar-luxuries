"use client";

import { type FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useIsStaff } from "@/lib/admin";
import { useAdminLogin } from "@/lib/auth/hooks";
import { safeNextPath } from "@/lib/auth/redirect";
import { toFormErrors } from "@/lib/form-errors";

/** Only /admin paths are honoured as the post-sign-in destination here. */
function adminNext(search: string): string {
  const next = safeNextPath(search);
  return next.startsWith("/admin") && !next.startsWith("/admin/login")
    ? next
    : "/admin";
}

export function AdminLoginForm() {
  const router = useRouter();
  const isStaff = useIsStaff();
  const { mutate, isPending, isSuccess, error, reset } = useAdminLogin();

  // A staff session — new or already live — goes straight to the console.
  useEffect(() => {
    if (isStaff) router.replace(adminNext(window.location.search));
  }, [isStaff, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutate({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      remember: false,
    });
  }

  const { fields, formMessage } = toFormErrors(error);
  const busy = isPending || isSuccess;

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit}
      onChange={() => {
        if (error) reset();
      }}
    >
      {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="username"
        shape="admin"
        error={fields.email}
        required
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        error={fields.password}
        required
      />
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center">
        <Link
          href="/"
          className="text-[13px] font-semibold text-accent-700 hover:text-accent-800"
        >
          ← Back to store
        </Link>
      </p>
    </form>
  );
}
