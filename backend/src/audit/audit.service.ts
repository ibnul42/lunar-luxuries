import { Global, Injectable, Module } from "@nestjs/common";

import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";

/** Records who changed what in the admin console (README §5 `AuditLog`). */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(entry: {
    actorId: string;
    action: "create" | "update" | "delete";
    entity: string;
    entityId: string;
    diff?: Prisma.InputJsonValue;
  }): Promise<void> {
    await this.prisma.auditLog.create({ data: entry });
  }
}

@Global()
@Module({ providers: [AuditService], exports: [AuditService] })
export class AuditModule {}
