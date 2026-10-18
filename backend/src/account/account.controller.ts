import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";

import { CurrentUser } from "../auth/current-user.decorator";
import type { PublicUser } from "../auth/public-user";
import { readSessionToken } from "../auth/session-cookie";
import { SessionGuard } from "../auth/session.guard";
import { AddressDto, ChangePasswordDto, UpdateProfileDto } from "./account.dto";
import { AccountService } from "./account.service";

@Controller("account")
@UseGuards(SessionGuard)
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Patch("profile")
  async updateProfile(
    @CurrentUser() user: PublicUser,
    @Body() body: UpdateProfileDto,
  ): Promise<{ user: PublicUser }> {
    return { user: await this.account.updateProfile(user.id, body) };
  }

  @Post("password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  changePassword(
    @CurrentUser() user: PublicUser,
    @Body() body: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<void> {
    return this.account.changePassword(user.id, body, readSessionToken(req));
  }

  @Get("addresses")
  addresses(@CurrentUser() user: PublicUser) {
    return this.account.addresses(user.id);
  }

  @Post("addresses")
  createAddress(@CurrentUser() user: PublicUser, @Body() body: AddressDto) {
    return this.account.createAddress(user.id, body);
  }

  @Patch("addresses/:id")
  updateAddress(
    @CurrentUser() user: PublicUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: AddressDto,
  ) {
    return this.account.updateAddress(user.id, id, body);
  }

  @Put("addresses/:id/default")
  @HttpCode(HttpStatus.NO_CONTENT)
  setDefault(
    @CurrentUser() user: PublicUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.account.setDefaultAddress(user.id, id);
  }

  @Delete("addresses/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(
    @CurrentUser() user: PublicUser,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.account.deleteAddress(user.id, id);
  }

  @Get("orders")
  orders(@CurrentUser() user: PublicUser) {
    return this.account.orders(user.id);
  }

  @Get("orders/:number")
  order(@CurrentUser() user: PublicUser, @Param("number") number: string) {
    return this.account.order(user.id, number);
  }
}
