import { Transform, type TransformFnParams } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/** Mirrors `MIN_PASSWORD_LENGTH` in the storefront's register form. */
export const MIN_PASSWORD_LENGTH = 8;
/** Generous for passphrases, but bounds the work one request can ask Argon2 to do. */
export const MAX_PASSWORD_LENGTH = 128;

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim() : value;

/** `User.email` is unique on the lower-cased value — see schema.prisma. */
const normalizeEmail = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

export class RegisterDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Enter your name." })
  @MaxLength(100, { message: "Keep your name under 100 characters." })
  name!: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: "Enter a valid email address." })
  @MaxLength(254, { message: "Enter a valid email address." })
  email!: string;

  // Never trimmed: leading and trailing spaces are part of the password.
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: `Use at most ${MAX_PASSWORD_LENGTH} characters.`,
  })
  password!: string;
}

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: "Enter a valid email address." })
  @MaxLength(254, { message: "Enter a valid email address." })
  email!: string;

  // No minimum here: an account created under an older, shorter policy must
  // still be able to sign in. Too long is reported like any wrong password.
  @IsString()
  @IsNotEmpty({ message: "Enter your password." })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: "Incorrect email or password.",
  })
  password!: string;

  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}
