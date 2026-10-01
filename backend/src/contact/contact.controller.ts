import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import { PrismaService } from "../prisma/prisma.service";
import { ContactDto } from "./contact.dto";

const MINUTE = 60_000;

@Controller("contact")
export class ContactController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Stores the message and answers 204 — nothing in the body is worth echoing
   * back. Public, so it is rate limited like registration (README §8).
   */
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: MINUTE } })
  async send(@Body() body: ContactDto): Promise<void> {
    await this.prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        subject: body.subject ?? null,
        message: body.message,
      },
    });
  }
}
