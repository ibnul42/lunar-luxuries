"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_LIMITS, sendContactMessage } from "@/lib/contact";
import { toFormErrors } from "@/lib/form-errors";

export function ContactForm() {
  const { mutate, isPending, isSuccess, error, reset } = useMutation({
    mutationFn: sendContactMessage,
  });
  const confirmationRef = useRef<HTMLHeadingElement>(null);

  // The form unmounts on success, taking focus with it. Put focus on the
  // confirmation so keyboard and screen-reader users land on the outcome.
  useEffect(() => {
    if (isSuccess) confirmationRef.current?.focus();
  }, [isSuccess]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    mutate({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    });
  }

  if (isSuccess) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-6">
        <CircleCheck
          size={32}
          strokeWidth={2.5}
          aria-hidden
          className="text-sage-700"
        />
        <h3
          ref={confirmationRef}
          tabIndex={-1}
          className="font-display text-xl text-text"
        >
          Message sent — thank you.
        </h3>
        <p className="text-[15px] leading-relaxed text-muted">
          We read every message and reply within one business day.
        </p>
        <Button variant="secondary" onClick={reset}>
          Send another message
        </Button>
      </div>
    );
  }

  const { fields, formMessage } = toFormErrors(error);

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit}
      // Clear a failed attempt as soon as the visitor starts fixing it.
      onChange={() => {
        if (error) reset();
      }}
    >
      {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Name"
          name="name"
          autoComplete="name"
          placeholder="Jordan Avery"
          maxLength={CONTACT_LIMITS.name}
          error={fields.name}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          maxLength={CONTACT_LIMITS.email}
          error={fields.email}
          required
        />
      </div>

      <Input
        label="Subject"
        name="subject"
        placeholder="Order question, wholesale, press…"
        hint="Optional."
        maxLength={CONTACT_LIMITS.subject}
        error={fields.subject}
      />

      <Textarea
        label="Message"
        name="message"
        placeholder="How can we help?"
        maxLength={CONTACT_LIMITS.message}
        error={fields.message}
        required
      />

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
