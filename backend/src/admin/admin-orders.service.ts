import { Injectable, NotFoundException } from "@nestjs/common";

import { AuditService } from "../audit/audit.service";
import type { OrderStatus, Prisma } from "../generated/prisma/client";
import {
  orderDetailInclude,
  orderSummarySelect,
  toOrderDetail,
  toOrderSummary,
} from "../orders/order-view";
import { PrismaService } from "../prisma/prisma.service";
import type { AdminListQuery } from "./admin.dto";

const DAY = 86_400_000;
/** Money that did not stay with the store is not revenue. */
const COUNTED: Prisma.OrderWhereInput = {
  status: { notIn: ["REFUNDED", "CANCELLED"] },
};

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Last 30 days against the 30 before them. */
  async dashboard() {
    const now = Date.now();
    const currentFrom = new Date(now - 30 * DAY);
    const previousFrom = new Date(now - 60 * DAY);

    const period = async (from: Date, to: Date) => {
      const range = { gte: from, lt: to };
      const [orders, customers] = await Promise.all([
        this.prisma.order.aggregate({
          where: { ...COUNTED, placedAt: range },
          _sum: { totalCents: true },
          _count: { _all: true },
        }),
        this.prisma.user.count({
          where: { role: "CUSTOMER", createdAt: range },
        }),
      ]);
      const revenueCents = orders._sum.totalCents ?? 0;
      const orderCount = orders._count._all;
      return {
        revenueCents,
        orders: orderCount,
        newCustomers: customers,
        averageOrderCents:
          orderCount === 0 ? 0 : Math.round(revenueCents / orderCount),
      };
    };

    const [current, previous, recent, topLines] = await Promise.all([
      period(currentFrom, new Date(now)),
      period(previousFrom, currentFrom),
      this.prisma.order.findMany({
        orderBy: { placedAt: "desc" },
        take: 5,
        select: orderSummarySelect,
      }),
      this.prisma.orderItem.groupBy({
        by: ["nameSnapshot"],
        where: { order: { ...COUNTED, placedAt: { gte: currentFrom } } },
        _sum: { qty: true },
        orderBy: { _sum: { qty: "desc" } },
        take: 5,
      }),
    ]);

    // Revenue per product needs price × qty, which groupBy cannot sum.
    const revenueRows = await this.prisma.orderItem.findMany({
      where: {
        nameSnapshot: { in: topLines.map((line) => line.nameSnapshot) },
        order: { ...COUNTED, placedAt: { gte: currentFrom } },
      },
      select: { nameSnapshot: true, unitPriceCents: true, qty: true },
    });

    return {
      current,
      previous,
      recentOrders: recent.map(toOrderSummary),
      topProducts: topLines.map((line) => ({
        name: line.nameSnapshot,
        units: line._sum.qty ?? 0,
        revenueCents: revenueRows
          .filter((row) => row.nameSnapshot === line.nameSnapshot)
          .reduce((sum, row) => sum + row.unitPriceCents * row.qty, 0),
      })),
    };
  }

  async list(query: AdminListQuery) {
    const q = query.q?.replace(/^#/, "");
    const rows = await this.prisma.order.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(q
          ? {
              OR: [
                { number: { contains: q } },
                { customerName: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { placedAt: "desc" },
      take: 200,
      select: orderSummarySelect,
    });
    return rows.map(toOrderSummary);
  }

  async detail(number: string) {
    const order = await this.prisma.order.findUnique({
      where: { number },
      include: orderDetailInclude,
    });
    if (!order) throw new NotFoundException("We couldn't find that order.");

    const orderCount = order.userId
      ? await this.prisma.order.count({ where: { userId: order.userId } })
      : 1;

    return {
      ...toOrderDetail(order),
      customer: { isGuest: !order.userId, orderCount },
    };
  }

  /**
   * Moving to Shipped or Delivered stamps the shipment, so the customer's
   * tracking timeline follows. A refund only changes the status — no payment
   * was ever taken (checkout is deferred, README §10 q1).
   */
  async setStatus(actorId: string, number: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { number },
      include: { shipment: true },
    });
    if (!order) throw new NotFoundException("We couldn't find that order.");

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status } });

      if (status === "SHIPPED" || status === "DELIVERED") {
        await tx.shipment.upsert({
          where: { orderId: order.id },
          create: {
            orderId: order.id,
            shippedAt: now,
            deliveredAt: status === "DELIVERED" ? now : null,
          },
          update: {
            shippedAt: order.shipment?.shippedAt ?? now,
            deliveredAt:
              status === "DELIVERED"
                ? (order.shipment?.deliveredAt ?? now)
                : null,
          },
        });
      }
    });

    await this.audit.record({
      actorId,
      action: "update",
      entity: "order",
      entityId: order.id,
      diff: { status: { from: order.status, to: status } },
    });

    return this.detail(number);
  }

  async customers(query: AdminListQuery) {
    const rows = await this.prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        ...(query.q
          ? {
              OR: [
                { name: { contains: query.q, mode: "insensitive" } },
                { email: { contains: query.q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    const spent = await this.prisma.order.groupBy({
      by: ["userId"],
      where: { ...COUNTED, userId: { in: rows.map((row) => row.id) } },
      _sum: { totalCents: true },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      joinedAt: row.createdAt,
      orders: row._count.orders,
      totalSpentCents:
        spent.find((s) => s.userId === row.id)?._sum.totalCents ?? 0,
    }));
  }
}
