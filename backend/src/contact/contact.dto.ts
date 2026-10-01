import { Transform, type TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

/** Mirrored as `maxLength` on the storefront's contact form. */
export const MAX_SUBJECT_LENGTH = 150;
export const MAX_MESSAGE_LENGTH = 5000;

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim() : value;

const normalizeEmail = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

/** An empty subject means "none", not a validation error. */
const trimToUndefined = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim() || undefined : value;

export class ContactDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Enter your name." })
  @MaxLength(100, { message: "Keep your name under 100 characters." })
  name!: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: "Enter a valid email address." })
  @MaxLength(254, { message: "Enter a valid email address." })
  email!: string;

  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(MAX_SUBJECT_LENGTH, {
    message: `Keep the subject under ${MAX_SUBJECT_LENGTH} characters.`,
  })
  subject?: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Write a message." })
  @MaxLength(MAX_MESSAGE_LENGTH, {
    message: `Keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
  })
  message!: string;
}
