import { IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";

import { MAX_LINE_QTY } from "./cart.service";

/** Variant and quantity only — never a price (README §8). */
export class AddCartItemDto {
  @IsUUID("all", { message: "Choose an option." })
  variantId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_LINE_QTY)
  qty?: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  @Max(MAX_LINE_QTY)
  qty!: number;
}
