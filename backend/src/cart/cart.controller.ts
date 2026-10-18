import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";

import { optionalUser } from "../auth/optional-user";
import { SessionsService } from "../auth/sessions.service";
import type { Env } from "../config/env.validation";
import { newCartToken, readCartToken, setCartCookie } from "./cart-cookie";
import { AddCartItemDto, UpdateCartItemDto } from "./cart.dto";
import { type CartOwner, CartService, type CartView } from "./cart.service";

/**
 * Serves guests and members alike: a signed-in request uses the account's
 * cart, anyone else the cart behind their `ll_cart` cookie (created on the
 * first add).
 */
@Controller("cart")
export class CartController {
  private readonly isProduction: boolean;

  constructor(
    private readonly cart: CartService,
    private readonly sessions: SessionsService,
    config: ConfigService<Env, true>,
  ) {
    this.isProduction =
      config.get("NODE_ENV", { infer: true }) === "production";
  }

  private async owner(req: Request): Promise<CartOwner> {
    const user = await optionalUser(req, this.sessions);
    if (user) return { userId: user.id };
    const token = readCartToken(req);
    return token ? { token } : null;
  }

  @Get()
  async get(@Req() req: Request): Promise<CartView> {
    return this.cart.view(await this.owner(req));
  }

  @Post("items")
  async add(
    @Body() body: AddCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CartView> {
    let owner = await this.owner(req);
    if (!owner) {
      const token = newCartToken();
      setCartCookie(res, token, this.isProduction);
      owner = { token };
    }
    return this.cart.add(owner, body.variantId, body.qty ?? 1);
  }

  @Patch("items/:id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateCartItemDto,
    @Req() req: Request,
  ): Promise<CartView> {
    return this.cart.setQty(await this.owner(req), id, body.qty);
  }

  @Delete("items/:id")
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<CartView> {
    return this.cart.remove(await this.owner(req), id);
  }
}
