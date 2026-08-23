"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

/** Mirrors the `minLength` on the field; the server must enforce it too. */
const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm() {
  const [confirmError, setConfirmError] = useState<string>();

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
    // TODO(Phase 1): POST to the Auth.js credentials sign-up action. Argon2id
    // hashing and an enumeration-resistant response live server-side (README §8).
  }

  return (
    <div className="space-y-8">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Amina Rahman"
          required
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={MIN_PASSWORD_LENGTH}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
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

        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>

      <div className="flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-[12px] font-semibold tracking-wide text-muted uppercase">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* TODO: wire to Auth.js Google/Apple OAuth providers */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" className="w-full">
          Google
        </Button>
        <Button variant="secondary" className="w-full">
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
