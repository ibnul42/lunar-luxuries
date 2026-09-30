import { BadRequestException, type ValidationError } from "@nestjs/common";

/**
 * Nest's default 400 body is `message: string[]` — sentences with no field
 * attached, which a form cannot place next to the right input. This keys one
 * message per field instead, matching the shape every other error uses:
 *
 *   { statusCode: 400, message: "Check the highlighted fields.",
 *     errors: { email: "Enter a valid email address." } }
 *
 * Nested DTOs flatten to dotted paths (`address.postalCode`).
 */
export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const fields: Record<string, string> = {};

  const collect = (list: ValidationError[], prefix: string): void => {
    for (const error of list) {
      const path = prefix ? `${prefix}.${error.property}` : error.property;
      const message = Object.values(error.constraints ?? {})[0];
      if (message) fields[path] = message;
      if (error.children?.length) collect(error.children, path);
    }
  };
  collect(errors, "");

  return new BadRequestException({
    statusCode: 400,
    message: "Check the highlighted fields.",
    errors: fields,
  });
}
