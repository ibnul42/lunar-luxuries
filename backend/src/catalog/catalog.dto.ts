import { Transform, Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

import { trimToUndefined } from "../common/transforms";

export const PRODUCT_SORTS = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "name",
] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

/** `?category=jewelry,candles` — a comma list, deduplicated. */
const splitList = ({ value }: { value: unknown }): unknown =>
  typeof value === "string"
    ? [
        ...new Set(
          value
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        ),
      ]
    : value;

export class ProductListQuery {
  @IsOptional()
  @Transform(splitList)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  category?: string[];

  @IsOptional()
  @Transform(trimToUndefined)
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(["featured", "new"])
  collection?: "featured" | "new";

  @IsOptional()
  @IsIn(PRODUCT_SORTS)
  sort?: ProductSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}

export class PageQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}
