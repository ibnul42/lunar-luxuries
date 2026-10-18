"use client";

import { type FormEvent, useState } from "react";
import { MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";
import {
  type Address,
  type AddressInput,
  formatAddress,
  useAddresses,
  useDeleteAddress,
  useSaveAddress,
  useSetDefaultAddress,
} from "@/lib/account";
import { toFormErrors } from "@/lib/form-errors";

const text = (data: FormData, key: string) => String(data.get(key) ?? "");

function AddressForm({
  address,
  onDone,
}: {
  address: Address | null;
  onDone: () => void;
}) {
  const save = useSaveAddress();
  const { fields, formMessage } = toFormErrors(save.error);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: AddressInput & { id?: string } = {
      id: address?.id,
      label: text(data, "label"),
      firstName: text(data, "firstName"),
      lastName: text(data, "lastName"),
      line1: text(data, "line1"),
      line2: text(data, "line2"),
      city: text(data, "city"),
      state: text(data, "state"),
      postalCode: text(data, "postalCode"),
      country: text(data, "country"),
      phone: text(data, "phone"),
      isDefault: data.get("isDefault") === "on",
    };
    save.mutate(input, { onSuccess: onDone });
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => {
        if (save.error) save.reset();
      }}
      className="space-y-4"
    >
      {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}
      <Input
        label="Label"
        name="label"
        placeholder="Home, Work…"
        defaultValue={address?.label ?? "Home"}
        maxLength={40}
        error={fields.label}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          name="firstName"
          autoComplete="given-name"
          defaultValue={address?.firstName}
          error={fields.firstName}
          required
        />
        <Input
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          defaultValue={address?.lastName}
          error={fields.lastName}
          required
        />
      </div>
      <Input
        label="Address"
        name="line1"
        autoComplete="address-line1"
        placeholder="House, road"
        defaultValue={address?.line1}
        error={fields.line1}
        required
      />
      <Input
        label="Area, apartment, suite"
        name="line2"
        autoComplete="address-line2"
        hint="Optional."
        defaultValue={address?.line2 ?? ""}
        error={fields.line2}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="City"
          name="city"
          autoComplete="address-level2"
          defaultValue={address?.city}
          error={fields.city}
          required
        />
        <Input
          label="Division / state"
          name="state"
          autoComplete="address-level1"
          defaultValue={address?.state ?? ""}
          error={fields.state}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Postal code"
          name="postalCode"
          autoComplete="postal-code"
          defaultValue={address?.postalCode}
          error={fields.postalCode}
          required
        />
        <Input
          label="Country"
          name="country"
          autoComplete="country-name"
          defaultValue={address?.country ?? "Bangladesh"}
          error={fields.country}
          required
        />
      </div>
      <Input
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        hint="Optional — for the courier."
        defaultValue={address?.phone ?? ""}
        error={fields.phone}
      />
      {address?.isDefault ? null : (
        <Checkbox name="isDefault" label="Make this my default address" />
      )}
      <Button type="submit" className="w-full" disabled={save.isPending}>
        {save.isPending ? "Saving…" : "Save address"}
      </Button>
    </form>
  );
}

function AddressCard({
  address,
  onEdit,
}: {
  address: Address;
  onEdit: () => void;
}) {
  const remove = useDeleteAddress();
  const setDefault = useSetDefaultAddress();
  const [confirming, setConfirming] = useState(false);

  return (
    <Card elevation="panel" className="flex h-full flex-col p-6">
      <div className="mb-3 flex items-center gap-2">
        <p className="font-semibold">{address.label}</p>
        {address.isDefault ? <Tag tone="sage">Default</Tag> : null}
      </div>
      <address className="flex-1 text-[15px] leading-relaxed text-text-secondary not-italic">
        {formatAddress(address).map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </address>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-[13px] font-semibold">
        {confirming ? (
          <>
            <span className="text-text">Delete this address?</span>
            <button
              type="button"
              onClick={() => remove.mutate(address.id)}
              disabled={remove.isPending}
              className="text-danger hover:underline"
            >
              {remove.isPending ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-muted hover:text-text"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="text-accent-700 hover:text-accent-800"
            >
              Edit<span className="sr-only"> {address.label}</span>
            </button>
            {address.isDefault ? null : (
              <button
                type="button"
                onClick={() => setDefault.mutate(address.id)}
                disabled={setDefault.isPending}
                className="text-accent-700 hover:text-accent-800"
              >
                Set as default
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-muted hover:text-danger"
            >
              Delete<span className="sr-only"> {address.label}</span>
            </button>
          </>
        )}
      </div>
    </Card>
  );
}

export function AddressesPanel() {
  const { data, isPending, error } = useAddresses();
  // `undefined` = closed, `null` = adding, an address = editing it.
  const [editing, setEditing] = useState<Address | null | undefined>(undefined);
  const close = () => setEditing(undefined);

  if (isPending) {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
    );
  }
  if (error) return <FormAlert>{error.message}</FormAlert>;

  return (
    <>
      {data.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          action={
            <Button onClick={() => setEditing(null)}>Add an address</Button>
          }
        >
          Save an address to check out faster later.
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {data.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setEditing(address)}
            />
          ))}
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-panel border-2 border-dashed border-border-strong text-[15px] font-semibold text-accent-700 transition-colors hover:border-accent-500 hover:bg-accent-100/40"
          >
            <Plus size={22} strokeWidth={2.75} aria-hidden />
            Add an address
          </button>
        </div>
      )}

      <Dialog
        open={editing !== undefined}
        onClose={close}
        title={editing ? `Edit ${editing.label}` : "New address"}
      >
        {/* Keyed so each open starts from the right address's values. */}
        {editing !== undefined ? (
          <AddressForm
            key={editing?.id ?? "new"}
            address={editing}
            onDone={close}
          />
        ) : null}
      </Dialog>
    </>
  );
}
