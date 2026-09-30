"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useRegister } from "@/lib/auth/hooks";
import { safeNextPath } from "@/lib/auth/redirect";
import { useSessionStatus } from "@/lib/auth/store";
import { toFormErrors } from "@/lib/form-errors";

/** Mirrors the API's `MIN_PASSWORD_LENGTH`; the server enforces it too. */
const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm() {
  const router = useRouter();
  const status = useSessionStatus();
  const [confirmError, setConfirmError] = useState<string>();
  const { mutate, isPending, isSuccess, error, reset } = useRegister();

  // Registration signs the new account in, so the same redirect ends this
  // screen — and bounces anyone who is already signed in.
  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace(safeNextPath(window.location.search));
  }, [status, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // `required`, `type=email` and `minLength` are enforced natively before we
    // get here; only the cross-field match needs checking by hand.
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirmPassword") ?? "");

    if (password !== confirm) {
      setConfirmError("Passwords do not match.");
      return;
    }

    setConfirmError(undefined);
    // Only the three fields the API accepts: it rejects unknown properties
    // outright, so `confirmPassword` and `terms` stay on the client.
    mutate({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password,
    });
  }

  const { fields, formMessage } = toFormErrors(error);
  const busy = isPending || isSuccess;

  return (
    <div className="space-y-8">
      <form
        className="space-y-5"
        onSubmit={handleSubmit}
        onChange={() => {
          if (error) reset();
        }}
      >
        {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}

        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Amina Rahman"
          error={fields.name}
          required
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={fields.email}
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={MIN_PASSWORD_LENGTH}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={fields.password}
          required
        />

        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={MIN_PASSWORD_LENGTH}
          error={confirmError}
          onChange={() => setConfirmError(undefined)}
          required
        />

        <Checkbox
          name="terms"
          required
          label={
            <span>
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-semibold text-accent-700 hover:text-accent-800"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-accent-700 hover:text-accent-800"
              >
                Privacy Policy
              </Link>
              .
            </span>
          }
        />

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent-700 hover:text-accent-800"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
