import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "../auth/auth.dto";
import { normalizeEmail, trim, trimToUndefined } from "../common/transforms";

export class UpdateProfileDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Enter your name." })
  @MaxLength(100, { message: "Keep your name under 100 characters." })
  name!: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: "Enter a valid email address." })
  @MaxLength(254, { message: "Enter a valid email address." })
  email!: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: "Enter your current password." })
  @MaxLength(MAX_PASSWORD_LENGTH, { message: "That password isn't right." })
  currentPassword!: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: `Use at most ${MAX_PASSWORD_LENGTH} characters.`,
  })
  newPassword!: string;
}

const required = (field: string, max = 120) => [
  Transform(trim),
  IsString(),
  IsNotEmpty({ message: `Enter ${field}.` }),
  MaxLength(max, { message: `Keep this under ${max} characters.` }),
];

const optional = (max = 120) => [
  Transform(trimToUndefined),
  IsOptional(),
  IsString(),
  MaxLength(max, { message: `Keep this under ${max} characters.` }),
];

/** Applies a list of property decorators — keeps the address DTO readable. */
const all =
  (decorators: PropertyDecorator[]): PropertyDecorator =>
  (target, key) => {
    for (const decorator of decorators) decorator(target, key);
  };

export class AddressDto {
  @all(required("a label, such as Home", 40))
  label!: string;

  @all(required("a first name", 60))
  firstName!: string;

  @all(required("a last name", 60))
  lastName!: string;

  @all(required("the street address", 200))
  line1!: string;

  @all(optional(200))
  line2?: string;

  @all(required("a city", 80))
  city!: string;

  @all(optional(80))
  state?: string;

  @all(required("a postal code", 20))
  postalCode!: string;

  @all(required("a country", 80))
  country!: string;

  @all(optional(30))
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
