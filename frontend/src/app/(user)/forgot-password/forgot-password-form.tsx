"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth/api";
import { toFormErrors } from "@/lib/form-errors";

const BACK = "text-[13px] font-semibold text-accent-700 hover:text-accent-800";

/**
 * The API answers the same way whether or not the address has an account
 * (README §8), so the confirmation says "if" — it can't know more.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess, error, reset } = useMutation({
    mutationFn: requestPasswordReset,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isSuccess) headingRef.current?.focus();
  }, [isSuccess]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutate(email);
  }

  if (isSuccess) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 text-center"
      >
        <span className="grid size-16 place-items-center rounded-pill bg-sage-200 text-sage-800">
          <MailCheck size={28} strokeWidth={2.5} aria-hidden />
        </span>
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-h2">
          Check your email
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          If <strong className="text-text">{email}</strong> has an account,
          we&rsquo;ve sent it a link to reset the password. It expires in one
          hour.
        </p>
        <Link href="/login" className={BACK}>
          Back to sign in
        </Link>
      </div>
    );
  }

  const { fields, formMessage } = toFormErrors(error);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="kicker text-accent-700">Reset password</p>
        <h1 className="font-display text-h2">Forgot your password?</h1>
        <p className="text-[15px] text-muted">
          Enter your email and we&rsquo;ll send you a link to reset it.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        onChange={() => {
          if (error) reset();
        }}
        className="space-y-5"
      >
        {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fields.email}
          required
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center">
        <Link href="/login" className={BACK}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
