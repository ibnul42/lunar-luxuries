import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Module,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CurrentUser } from "../auth/current-user.decorator";
import type { PublicUser } from "../auth/public-user";
import { SessionGuard } from "../auth/session.guard";
import {
  type ProductCard,
  productCardSelect,
  toProductCard,
  visibleProductWhere,
} from "../catalog/product-card";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /** Newest first. Products that were retired since drop out silently. */
  async list(userId: string): Promise<ProductCard[]> {
    const rows = await this.prisma.wishlistItem.findMany({
      where: { userId, product: visibleProductWhere },
      orderBy: { createdAt: "desc" },
      select: { product: { select: productCardSelect } },
    });
    return rows.map((row) => toProductCard(row.product));
  }

  async add(userId: string, productId: string): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, ...visibleProductWhere },
      select: { id: true },
    });
    if (!product) throw new NotFoundException("We couldn't find that product.");

    await this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
  }

  async remove(userId: string, productId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  }
}

/** Members only — README defaults: signed-out hearts go to /login. */
@Controller("wishlist")
@UseGuards(SessionGuard)
class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  list(@CurrentUser() user: PublicUser): Promise<ProductCard[]> {
    return this.wishlist.list(user.id);
  }

  /** Idempotent: saving twice is still one entry. */
  @Put(":productId")
  @HttpCode(HttpStatus.NO_CONTENT)
  add(
    @CurrentUser() user: PublicUser,
    @Param("productId", ParseUUIDPipe) productId: string,
  ): Promise<void> {
    return this.wishlist.add(user.id, productId);
  }

  @Delete(":productId")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: PublicUser,
    @Param("productId", ParseUUIDPipe) productId: string,
  ): Promise<void> {
    return this.wishlist.remove(user.id, productId);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
