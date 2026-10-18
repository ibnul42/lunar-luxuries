import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Module,
  Post,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Transform } from "class-transformer";
import { IsEmail, MaxLength } from "class-validator";

import { normalizeEmail } from "../common/transforms";
import { PrismaService } from "../prisma/prisma.service";

class SubscribeDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: "Enter a valid email address." })
  @MaxLength(254, { message: "Enter a valid email address." })
  email!: string;
}

@Controller("newsletter")
class NewsletterController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Always 204, subscribed already or not, so the form cannot be used to test
   * which addresses are on the list. Re-subscribing clears an unsubscribe.
   */
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async subscribe(@Body() body: SubscribeDto): Promise<void> {
    await this.prisma.newsletterSub.upsert({
      where: { email: body.email },
      update: { unsubscribedAt: null },
      create: { email: body.email },
    });
  }
}

@Module({ controllers: [NewsletterController] })
export class NewsletterModule {}
