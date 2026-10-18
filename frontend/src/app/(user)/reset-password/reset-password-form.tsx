"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { PasswordInput } from "@/components/ui/password-input";
import { resetPassword } from "@/lib/auth/api";
import { toFormErrors } from "@/lib/form-errors";

/** Mirrors `MIN_PASSWORD_LENGTH` in backend/src/auth/auth.dto.ts. */
const MIN_PASSWORD_LENGTH = 8;

/**
 * The second half of the reset flow: the link from the email lands here with
 * `?token=`. A successful reset signs the account out everywhere, so the next
 * step is a fresh sign-in.
 */
export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [mismatch, setMismatch] = useState(false);
  const { mutate, isPending, isSuccess, error, reset } = useMutation({
    mutationFn: resetPassword,
  });

  if (isSuccess) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 text-center"
      >
        <CircleCheck
          size={40}
          strokeWidth={2.25}
          aria-hidden
          className="text-sage-700"
        />
        <h1 className="font-display text-h2">Password updated</h1>
        <p className="text-[15px] text-muted">
          For your security we&rsquo;ve signed you out everywhere. Sign in with
          your new password.
        </p>
        <Link href="/login" className={buttonClasses({ className: "w-full" })}>
          Sign in
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-display text-h2">This link is incomplete</h1>
        <p className="text-[15px] text-muted">
          Open the link from your email again, or request a new one.
        </p>
        <Link href="/forgot-password" className={buttonClasses()}>
          Request a new link
        </Link>
      </div>
    );
  }

  // A bad or expired token comes back on the `token` field.
  const { fields, formMessage } = toFormErrors(error);
  const tokenProblem = fields.token;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    if (password !== data.get("confirm")) {
      setMismatch(true);
      return;
    }
    mutate({ token, password });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="kicker text-accent-700">Reset password</p>
        <h1 className="font-display text-h2">Choose a new password</h1>
      </div>

      {tokenProblem ? (
        <div className="space-y-4">
          <FormAlert>{tokenProblem}</FormAlert>
          <Link
            href="/forgot-password"
            className={buttonClasses({ className: "w-full" })}
          >
            Request a new link
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          onChange={() => {
            setMismatch(false);
            if (error) reset();
          }}
          className="space-y-5"
        >
          {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}
          <PasswordInput
            label="New password"
            name="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            error={fields.password}
            required
          />
          <PasswordInput
            label="Confirm new password"
            name="confirm"
            autoComplete="new-password"
            error={mismatch ? "The passwords don't match." : undefined}
            required
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : "Set new password"}
          </Button>
        </form>
      )}
    </div>
  );
}
