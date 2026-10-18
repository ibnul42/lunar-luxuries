import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

import { normalizeEmail, trim, trimToUndefined } from "../common/transforms";
import { CURRENCIES } from "../settings/settings.defaults";

const ORDER_STATUSES = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
  "CANCELLED",
] as const;
const PRODUCT_STATUSES = ["ACTIVE", "DRAFT", "OUT_OF_STOCK"] as const;
const CATEGORY_STATUSES = ["ACTIVE", "HIDDEN"] as const;

/** A generous ceiling on any one price: ৳10,000,000 in poisha. */
const MAX_PRICE_CENTS = 1_000_000_000;

export class AdminListQuery {
  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: (typeof ORDER_STATUSES)[number];
}

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES, { message: "Choose a status." })
  status!: (typeof ORDER_STATUSES)[number];
}

export class VariantStockDto {
  @IsUUID()
  id!: string;

  @IsInt({ message: "Stock is a whole number." })
  @Min(0, { message: "Stock can't be negative." })
  @Max(100_000)
  stockQty!: number;
}

export class ProductInputDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Give the product a name." })
  @MaxLength(120, { message: "Keep the name under 120 characters." })
  name!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Write a short description." })
  @MaxLength(5000, { message: "Keep the description under 5,000 characters." })
  description!: string;

  @IsUUID("all", { message: "Choose a category." })
  categoryId!: string;

  @IsIn(PRODUCT_STATUSES, { message: "Choose a status." })
  status!: (typeof PRODUCT_STATUSES)[number];

  /** Minor units — the form converts taka to poisha before sending. */
  @IsInt({ message: "Enter a price." })
  @Min(0, { message: "Price can't be negative." })
  @Max(MAX_PRICE_CENTS, { message: "That price is too high." })
  priceCents!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_PRICE_CENTS)
  compareAtPriceCents?: number | null;

  /** For a single-variant product (the design's one "Stock" field). */
  @IsOptional()
  @IsInt({ message: "Stock is a whole number." })
  @Min(0, { message: "Stock can't be negative." })
  @Max(100_000)
  stockQty?: number;

  /** For a product with options: stock per variant. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => VariantStockDto)
  variants?: VariantStockDto[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;
}

export class CategoryInputDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Give the category a name." })
  @MaxLength(60, { message: "Keep the name under 60 characters." })
  name!: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  @MaxLength(500, { message: "Keep the description under 500 characters." })
  description?: string;

  @IsOptional()
  @IsIn(CATEGORY_STATUSES, { message: "Choose a status." })
  status?: (typeof CATEGORY_STATUSES)[number];

  /** Set to create a subcategory. Only one level of nesting is allowed. */
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class CategoryUpdateDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Give the category a name." })
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(CATEGORY_STATUSES)
  status?: (typeof CATEGORY_STATUSES)[number];
}

export class SettingsUpdateDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Enter the store name." })
  @MaxLength(80)
  storeName?: string;

  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail({}, { message: "Enter a valid email address." })
  supportEmail?: string;

  @IsOptional()
  @IsIn(CURRENCIES, { message: "Choose a currency." })
  currency?: (typeof CURRENCIES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(60)
  timezone?: string;

  @IsOptional()
  @IsInt({ message: "Enter an amount." })
  @Min(0, { message: "Can't be negative." })
  @Max(MAX_PRICE_CENTS)
  flatRateCents?: number;

  @IsOptional()
  @IsInt({ message: "Enter an amount." })
  @Min(0, { message: "Can't be negative." })
  @Max(MAX_PRICE_CENTS)
  freeShippingThresholdCents?: number;

  @IsOptional()
  @IsBoolean()
  internationalShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  payCards?: boolean;

  @IsOptional()
  @IsBoolean()
  payGoogle?: boolean;

  @IsOptional()
  @IsBoolean()
  payApple?: boolean;
}
