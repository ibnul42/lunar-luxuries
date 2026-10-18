"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { useApplySession } from "@/lib/auth/hooks";
import type { SessionUser } from "@/lib/auth/api";
import { useSessionStatus } from "@/lib/auth/store";

/** Mirrors backend/src/orders/order-view.ts. */
export type OrderStatus =
  "PROCESSING" | "SHIPPED" | "DELIVERED" | "REFUNDED" | "CANCELLED";

export interface OrderSummary {
  id: string;
  number: string;
  status: OrderStatus;
  placedAt: string;
  totalCents: number;
  currency: string;
  customerName: string;
  email: string;
  itemCount: number;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
}

export interface OrderDetail {
  id: string;
  number: string;
  status: OrderStatus;
  placedAt: string;
  email: string;
  customerName: string;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  shippingAddress: OrderAddress;
  paymentMethod: string;
  items: {
    id: string;
    name: string;
    variantLabel: string | null;
    slug: string | null;
    unitPriceCents: number;
    qty: number;
    lineTotalCents: number;
  }[];
  shipment: {
    carrier: string | null;
    trackingNumber: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
  timeline: {
    key: "placed" | "shipped" | "delivered" | "refunded" | "cancelled";
    label: string;
    at: string | null;
    done: boolean;
  }[];
}

export interface Address extends OrderAddress {
  id: string;
  label: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "id" | "isDefault"> & {
  isDefault?: boolean;
};

const keys = {
  orders: ["account", "orders"] as const,
  order: (number: string) => ["account", "orders", number] as const,
  addresses: ["account", "addresses"] as const,
};

function useMemberQuery<T>(key: readonly unknown[], path: string) {
  const status = useSessionStatus();
  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) => apiFetch<T>(path, { signal }),
    enabled: status === "authenticated",
  });
}

export function useMyOrders() {
  return useMemberQuery<OrderSummary[]>(keys.orders, "/account/orders");
}

export function useMyOrder(number: string) {
  return useMemberQuery<OrderDetail>(
    keys.order(number),
    `/account/orders/${encodeURIComponent(number)}`,
  );
}

export function useAddresses() {
  return useMemberQuery<Address[]>(keys.addresses, "/account/addresses");
}

function useAddressMutation<TInput>(
  request: (input: TInput) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.addresses }),
  });
}

export function useSaveAddress() {
  return useAddressMutation(
    ({ id, ...input }: AddressInput & { id?: string }) =>
      id
        ? apiFetch<Address>(`/account/addresses/${id}`, {
            method: "PATCH",
            json: input,
          })
        : apiFetch<Address>("/account/addresses", { json: input }),
  );
}

export function useDeleteAddress() {
  return useAddressMutation((id: string) =>
    apiFetch<void>(`/account/addresses/${id}`, { method: "DELETE" }),
  );
}

export function useSetDefaultAddress() {
  return useAddressMutation((id: string) =>
    apiFetch<void>(`/account/addresses/${id}/default`, { method: "PUT" }),
  );
}

export function useUpdateProfile() {
  const applySession = useApplySession();
  return useMutation({
    mutationFn: (input: { name: string; email: string }) =>
      apiFetch<{ user: SessionUser }>("/account/profile", {
        method: "PATCH",
        json: input,
      }),
    onSuccess: ({ user }) => applySession(user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      apiFetch<void>("/account/password", { json: input }),
  });
}

/** Guest lookup — order number + the email it was placed with. */
export function trackOrder(input: { number: string; email: string }) {
  return apiFetch<OrderDetail>("/orders/track", { json: input });
}

export function formatAddress(address: OrderAddress): string[] {
  return [
    `${address.firstName} ${address.lastName}`.trim(),
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.country,
    address.phone,
  ].filter((line): line is string => Boolean(line));
}
