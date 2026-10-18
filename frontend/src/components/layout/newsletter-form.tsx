"use client";

import { type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toFormErrors } from "@/lib/form-errors";

/**
 * The sage band's signup. The API answers 204 whether or not the address was
 * already subscribed, so success here says nothing about the list.
 */
export function NewsletterForm({ id = "newsletter-email" }: { id?: string }) {
  const { mutate, isPending, isSuccess, error, reset } = useMutation({
    mutationFn: (email: string) =>
      apiFetch<void>("/newsletter", { json: { email } }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutate(String(new FormData(event.currentTarget).get("email") ?? ""));
  }

  if (isSuccess) {
    return (
      <p
        role="status"
        className="flex items-center gap-2.5 rounded-pill bg-white/15 px-6 py-3 text-[15px] font-semibold text-white"
      >
        <CircleCheck size={20} strokeWidth={2.5} aria-hidden />
        You&rsquo;re on the list — thank you.
      </p>
    );
  }

  const { fields, formMessage } = toFormErrors(error);

  return (
    <form
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={handleSubmit}
      onChange={() => {
        if (error) reset();
      }}
    >
      <div className="flex-1 text-left">
        <Input
          id={id}
          label="Email address"
          hideLabel
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          error={fields.email ?? formMessage}
          // Sits on the sage band, so the default `bg-input` fill would
          // disappear into it.
          className="bg-white/95 placeholder:text-text/55 hover:border-white"
        />
      </div>
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}
