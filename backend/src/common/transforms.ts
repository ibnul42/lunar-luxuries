import type { TransformFnParams } from "class-transformer";

/** `@Transform` helpers shared by the DTOs. */

export const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim() : value;

/** `User.email` is unique on the lower-cased value — see schema.prisma. */
export const normalizeEmail = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

/** An empty optional field means "none", not a validation error. */
export const trimToUndefined = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim() || undefined : value;
