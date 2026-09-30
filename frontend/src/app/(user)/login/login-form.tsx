"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useLogin } from "@/lib/auth/hooks";
import { safeNextPath } from "@/lib/auth/redirect";
import { useSessionStatus } from "@/lib/auth/store";
import { toFormErrors } from "@/lib/form-errors";

export function LoginForm() {
  const router = useRouter();
  const status = useSessionStatus();
  const { mutate, isPending, isSuccess, error, reset } = useLogin();

  // Covers both outcomes that end this screen: a sign-in that just succeeded,
  // and arriving here with a session already live.
  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace(safeNextPath(window.location.search));
  }, [status, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    mutate({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      remember: data.get("remember") === "on",
    });
  }

  const { fields, formMessage } = toFormErrors(error);
  // Stays disabled through the redirect that follows a success.
  const busy = isPending || isSuccess;

  return (
    <div className="space-y-8">
      <form
        className="space-y-5"
        onSubmit={handleSubmit}
        // Clear a failed attempt as soon as the visitor starts fixing it.
        onChange={() => {
          if (error) reset();
        }}
      >
        {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}

        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={fields.email}
          required
        />

        <div className="space-y-2">
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={fields.password}
            required
          />
          <div className="flex justify-end px-1">
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-accent-700 hover:text-accent-800"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Checkbox name="remember" label="Remember me" />

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-[12px] font-semibold tracking-wide text-muted uppercase">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Not wired yet: the API owns the OAuth callbacks, and neither provider
          is registered. Disabled rather than silently inert. */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" className="w-full" disabled>
          Google
        </Button>
        <Button variant="secondary" className="w-full" disabled>
          Apple
        </Button>
      </div>

      <p className="text-center text-[13px] text-muted">
        New to Lunar Luxuries?{" "}
        <Link
          href="/register"
          className="font-semibold text-accent-700 hover:text-accent-800"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
