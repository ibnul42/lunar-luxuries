import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Module,
  NotFoundException,
  Post,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

import { normalizeEmail } from "../common/transforms";
import { PrismaService } from "../prisma/prisma.service";
import {
  type OrderDetail,
  orderDetailInclude,
  toOrderDetail,
} from "./order-view";

class TrackOrderDto {
  /** Accepts "#48291" as well as "48291". */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().replace(/^#/, "") : value,
  )
  @IsString()
  @IsNotEmpty({ message: "Enter your order number." })
  @MaxLength(20, { message: "Enter your order number." })
  number!: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: "Enter the email you ordered with." })
  @MaxLength(254)
  email!: string;
}

const NOT_FOUND =
  "We couldn't find an order with that number and email. Check both and try again.";

@Controller("orders")
class OrdersController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guest lookup. The number *and* the email must match, and a miss gives one
   * message whichever was wrong, so order numbers cannot be enumerated.
   */
  @Post("track")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async track(@Body() body: TrackOrderDto): Promise<OrderDetail> {
    const order = await this.prisma.order.findFirst({
      where: { number: body.number, email: body.email },
      include: orderDetailInclude,
    });
    if (!order) throw new NotFoundException(NOT_FOUND);
    return toOrderDetail(order);
  }
}

@Module({ controllers: [OrdersController] })
export class OrdersModule {}
