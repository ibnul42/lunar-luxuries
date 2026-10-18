"use client";

import { type FormEvent, useEffect, useState } from "react";

import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import {
  CURRENCIES,
  type StoreSettings,
  useSaveSettings,
  useStoreSettings,
} from "@/lib/admin";
import { toFormErrors } from "@/lib/form-errors";
import { fromMinorUnits, toMinorUnits } from "@/lib/utils";

const TIMEZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
] as const;

type Tab = "general" | "shipping" | "payment";

/**
 * One form per tab, each saving only its own keys — the API merges a partial
 * patch, so saving Shipping never overwrites General.
 */
function SettingsForm({
  settings,
  children,
  toPatch,
}: {
  settings: StoreSettings;
  children: (errors: Record<string, string>) => React.ReactNode;
  toPatch: (data: FormData) => Partial<StoreSettings> | string;
}) {
  const save = useSaveSettings();
  const [saved, setSaved] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const { fields, formMessage } = toFormErrors(save.error);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(timer);
  }, [saved]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const patch = toPatch(new FormData(event.currentTarget));
    if (typeof patch === "string") {
      setLocalError(patch);
      return;
    }
    save.mutate(patch, { onSuccess: () => setSaved(true) });
  }

  return (
    <form
      // Remount on a fresh copy so defaults reflect what was just saved.
      key={JSON.stringify(settings)}
      onSubmit={handleSubmit}
      onChange={() => {
        setLocalError(undefined);
        if (save.error) save.reset();
      }}
      className="max-w-2xl space-y-5"
    >
      {formMessage || localError ? (
        <FormAlert>{localError ?? formMessage}</FormAlert>
      ) : null}
      {children(fields)}
      <div className="flex items-center gap-4 border-t border-border pt-5">
        <Button type="submit" size="admin" disabled={save.isPending}>
          {save.isPending ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </Button>
        <p role="status" className="sr-only">
          {saved ? "Settings saved." : ""}
        </p>
      </div>
    </form>
  );
}

export function SettingsView() {
  const { data: settings, isPending, error } = useStoreSettings();
  const [tab, setTab] = useState<Tab>("general");

  if (error) return <FormAlert>{error.message}</FormAlert>;

  return (
    <>
      <AdminPageHeader title="Settings" />
      {isPending ? (
        <Skeleton className="h-96" />
      ) : (
        <AdminPanel>
          <Tabs
            label="Settings sections"
            variant="segmented"
            value={tab}
            onChange={(id) => setTab(id as Tab)}
            panelClassName="pt-7"
            tabs={[
              {
                id: "general",
                label: "General",
                content: (
                  <SettingsForm
                    settings={settings}
                    toPatch={(data) => ({
                      storeName: String(data.get("storeName") ?? ""),
                      supportEmail: String(data.get("supportEmail") ?? ""),
                      currency: String(
                        data.get("currency"),
                      ) as StoreSettings["currency"],
                      timezone: String(data.get("timezone") ?? ""),
                    })}
                  >
                    {(fields) => (
                      <>
                        <Input
                          label="Store name"
                          name="storeName"
                          shape="admin"
                          defaultValue={settings.storeName}
                          error={fields.storeName}
                          required
                        />
                        <Input
                          label="Support email"
                          name="supportEmail"
                          type="email"
                          shape="admin"
                          defaultValue={settings.supportEmail}
                          error={fields.supportEmail}
                          required
                        />
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Select
                            label="Currency"
                            name="currency"
                            shape="admin"
                            defaultValue={settings.currency}
                            options={CURRENCIES.map((c) => ({
                              value: c,
                              label: c,
                            }))}
                            hint="Prices are stored as entered; switching does not convert them."
                            error={fields.currency}
                          />
                          <Select
                            label="Time zone"
                            name="timezone"
                            shape="admin"
                            defaultValue={settings.timezone}
                            options={TIMEZONES.map((z) => ({
                              value: z,
                              label: z,
                            }))}
                            error={fields.timezone}
                          />
                        </div>
                      </>
                    )}
                  </SettingsForm>
                ),
              },
              {
                id: "shipping",
                label: "Shipping",
                content: (
                  <SettingsForm
                    settings={settings}
                    toPatch={(data) => {
                      const flat = toMinorUnits(
                        String(data.get("flatRate") ?? ""),
                      );
                      const free = toMinorUnits(
                        String(data.get("freeThreshold") ?? ""),
                      );
                      if (flat === null || free === null) {
                        return "Enter both amounts as numbers, e.g. 150.";
                      }
                      return {
                        flatRateCents: flat,
                        freeShippingThresholdCents: free,
                        internationalShipping:
                          data.get("internationalShipping") === "on",
                      };
                    }}
                  >
                    {(fields) => (
                      <>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Input
                            label={`Flat rate (${settings.currency})`}
                            name="flatRate"
                            inputMode="decimal"
                            shape="admin"
                            defaultValue={fromMinorUnits(
                              settings.flatRateCents,
                            )}
                            error={fields.flatRateCents}
                            required
                          />
                          <Input
                            label={`Free shipping over (${settings.currency})`}
                            name="freeThreshold"
                            inputMode="decimal"
                            shape="admin"
                            defaultValue={fromMinorUnits(
                              settings.freeShippingThresholdCents,
                            )}
                            error={fields.freeShippingThresholdCents}
                            required
                          />
                        </div>
                        <Switch
                          name="internationalShipping"
                          label="International shipping"
                          description="Offer delivery outside Bangladesh."
                          defaultChecked={settings.internationalShipping}
                        />
                      </>
                    )}
                  </SettingsForm>
                ),
              },
              {
                id: "payment",
                label: "Payment",
                content: (
                  <SettingsForm
                    settings={settings}
                    toPatch={(data) => ({
                      payCards: data.get("payCards") === "on",
                      payGoogle: data.get("payGoogle") === "on",
                      payApple: data.get("payApple") === "on",
                    })}
                  >
                    {() => (
                      <>
                        <p className="rounded-nav bg-subtle px-4 py-3 text-[13px] text-text-secondary">
                          Saved for when checkout launches. Nothing is charged
                          until a payment provider is chosen (README §10 q1).
                        </p>
                        <Switch
                          name="payCards"
                          label="Credit & debit cards"
                          defaultChecked={settings.payCards}
                        />
                        <Switch
                          name="payGoogle"
                          label="Google Pay"
                          defaultChecked={settings.payGoogle}
                        />
                        <Switch
                          name="payApple"
                          label="Apple Pay"
                          defaultChecked={settings.payApple}
                        />
                      </>
                    )}
                  </SettingsForm>
                ),
              },
            ]}
          />
        </AdminPanel>
      )}
    </>
  );
}
