"use client";

import { type FormEvent, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

import { OrderDetailView } from "@/components/orders/order-detail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { trackOrder } from "@/lib/account";
import { toFormErrors } from "@/lib/form-errors";

/**
 * Guest lookup: number + the email it was placed with. A mutation rather than
 * a query because it is a POST — the email never goes in a URL (and so never
 * into history, logs or a Referer).
 */
export function TrackOrder() {
  const lookup = useMutation({ mutationFn: trackOrder });
  const resultRef = useRef<HTMLDivElement>(null);
  const { fields, formMessage } = toFormErrors(lookup.error);

  // Move focus to the result so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (lookup.data) resultRef.current?.focus();
  }, [lookup.data]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    lookup.mutate({
      number: String(data.get("number") ?? ""),
      email: String(data.get("email") ?? ""),
    });
  }

  return (
    <div className="space-y-10">
      <Card elevation="panel" className="mx-auto max-w-2xl p-6 sm:p-8">
        <form
          onSubmit={handleSubmit}
          onChange={() => {
            if (lookup.error) lookup.reset();
          }}
          className="space-y-5"
        >
          {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Order number"
              name="number"
              placeholder="48291"
              inputMode="numeric"
              autoComplete="off"
              error={fields.number}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={fields.email}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={lookup.isPending}>
            {lookup.isPending ? "Looking it up…" : "Track order"}
          </Button>
        </form>
      </Card>

      {lookup.data ? (
        <div ref={resultRef} tabIndex={-1}>
          <OrderDetailView order={lookup.data} />
        </div>
      ) : null}
    </div>
  );
}
