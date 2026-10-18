import type { OrderStatus, Prisma } from "../generated/prisma/client";

export const orderDetailInclude = {
  items: { orderBy: { id: "asc" } },
  shipment: true,
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderDetailInclude }>;

export interface OrderTimelineStep {
  key: "placed" | "shipped" | "delivered" | "refunded" | "cancelled";
  label: string;
  at: Date | null;
  done: boolean;
}

/**
 * The tracking timeline, derived from the order's own timestamps rather than
 * stored — so it can never disagree with the status.
 */
function timeline(order: OrderRow): OrderTimelineStep[] {
  const shippedAt = order.shipment?.shippedAt ?? null;
  const deliveredAt = order.shipment?.deliveredAt ?? null;
  const reached: Record<OrderStatus, number> = {
    PROCESSING: 0,
    SHIPPED: 1,
    DELIVERED: 2,
    REFUNDED: 2,
    CANCELLED: 0,
  };
  const step = reached[order.status];

  const steps: OrderTimelineStep[] = [
    { key: "placed", label: "Order placed", at: order.placedAt, done: true },
    { key: "shipped", label: "Shipped", at: shippedAt, done: step >= 1 },
    { key: "delivered", label: "Delivered", at: deliveredAt, done: step >= 2 },
  ];

  if (order.status === "REFUNDED") {
    steps.push({
      key: "refunded",
      label: "Refunded",
      at: order.updatedAt,
      done: true,
    });
  }
  if (order.status === "CANCELLED") {
    return [
      steps[0],
      { key: "cancelled", label: "Cancelled", at: order.updatedAt, done: true },
    ];
  }
  return steps;
}

export function toOrderDetail(order: OrderRow) {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    placedAt: order.placedAt,
    email: order.email,
    customerName: order.customerName,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.nameSnapshot,
      variantLabel: item.variantSnapshot,
      slug: item.productSlug,
      unitPriceCents: item.unitPriceCents,
      qty: item.qty,
      lineTotalCents: item.unitPriceCents * item.qty,
    })),
    shipment: order.shipment
      ? {
          carrier: order.shipment.carrier,
          trackingNumber: order.shipment.trackingNumber,
          shippedAt: order.shipment.shippedAt,
          deliveredAt: order.shipment.deliveredAt,
        }
      : null,
    timeline: timeline(order),
  };
}

export type OrderDetail = ReturnType<typeof toOrderDetail>;

export const orderSummarySelect = {
  id: true,
  number: true,
  status: true,
  placedAt: true,
  totalCents: true,
  currency: true,
  customerName: true,
  email: true,
  _count: { select: { items: true } },
  items: { select: { qty: true } },
} satisfies Prisma.OrderSelect;

type OrderSummaryRow = Prisma.OrderGetPayload<{
  select: typeof orderSummarySelect;
}>;

export function toOrderSummary(order: OrderSummaryRow) {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    placedAt: order.placedAt,
    totalCents: order.totalCents,
    currency: order.currency,
    customerName: order.customerName,
    email: order.email,
    itemCount: order.items.reduce((sum, item) => sum + item.qty, 0),
  };
}
