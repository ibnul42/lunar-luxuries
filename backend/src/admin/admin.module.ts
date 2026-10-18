import {
  Body,
  Controller,
  Delete,
  Get,
  Module,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { AuditService } from "../audit/audit.service";
import { AdminGuard } from "../auth/admin.guard";
import { AuthModule } from "../auth/auth.module";
import { CurrentUser } from "../auth/current-user.decorator";
import type { PublicUser } from "../auth/public-user";
import { SettingsService } from "../settings/settings.service";
import { AdminCatalogService } from "./admin-catalog.service";
import { AdminOrdersService } from "./admin-orders.service";
import {
  AdminListQuery,
  CategoryInputDto,
  CategoryUpdateDto,
  ProductInputDto,
  SettingsUpdateDto,
  UpdateOrderStatusDto,
} from "./admin.dto";

/**
 * The admin console's API. Every route is behind `AdminGuard` (STAFF/ADMIN).
 * Unlike /account, ids from the URL are trusted here *because* the caller is
 * staff — row-level scoping for staff is "may see everything".
 */
@Controller("admin")
@UseGuards(AdminGuard)
class AdminController {
  constructor(
    private readonly orders: AdminOrdersService,
    private readonly catalog: AdminCatalogService,
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
  ) {}

  @Get("dashboard")
  dashboard() {
    return this.orders.dashboard();
  }

  @Get("orders")
  listOrders(@Query() query: AdminListQuery) {
    return this.orders.list(query);
  }

  @Get("orders/:number")
  order(@Param("number") number: string) {
    return this.orders.detail(number);
  }

  @Patch("orders/:number")
  setOrderStatus(
    @CurrentUser() user: PublicUser,
    @Param("number") number: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.orders.setStatus(user.id, number, body.status);
  }

  @Get("customers")
  customers(@Query() query: AdminListQuery) {
    return this.orders.customers(query);
  }

  @Get("products")
  products(@Query() query: AdminListQuery) {
    return this.catalog.products(query);
  }

  @Post("products")
  createProduct(
    @CurrentUser() user: PublicUser,
    @Body() body: ProductInputDto,
  ) {
    return this.catalog.createProduct(user.id, body);
  }

  @Get("products/:id")
  product(@Param("id", ParseUUIDPipe) id: string) {
    return this.catalog.product(id);
  }

  @Patch("products/:id")
  updateProduct(
    @CurrentUser() user: PublicUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: ProductInputDto,
  ) {
    return this.catalog.updateProduct(user.id, id, body);
  }

  @Get("categories")
  categories() {
    return this.catalog.categories();
  }

  @Post("categories")
  createCategory(
    @CurrentUser() user: PublicUser,
    @Body() body: CategoryInputDto,
  ) {
    return this.catalog.createCategory(user.id, body);
  }

  @Patch("categories/:id")
  updateCategory(
    @CurrentUser() user: PublicUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: CategoryUpdateDto,
  ) {
    return this.catalog.updateCategory(user.id, id, body);
  }

  @Delete("categories/:id")
  deleteCategory(
    @CurrentUser() user: PublicUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.catalog.deleteCategory(user.id, id);
  }

  @Get("settings")
  getSettings() {
    return this.settings.getAll();
  }

  @Patch("settings")
  async updateSettings(
    @CurrentUser() user: PublicUser,
    @Body() body: SettingsUpdateDto,
  ) {
    const settings = await this.settings.update(body);
    await this.audit.record({
      actorId: user.id,
      action: "update",
      entity: "settings",
      entityId: "store",
      diff: { ...body },
    });
    return settings;
  }
}

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminOrdersService, AdminCatalogService],
})
export class AdminModule {}
