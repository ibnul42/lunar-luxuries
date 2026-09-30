import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";

import type { Env } from "../config/env.validation";
import { PrismaClient } from "../generated/prisma/client";

/**
 * The one PrismaClient for the process — each instance owns a connection pool,
 * so inject this rather than constructing another.
 *
 * It connects lazily on the first query instead of in `onModuleInit`: a
 * database that is down at boot should fail requests (and, later, a readiness
 * probe), not stop the process from starting and trigger a restart loop.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get("DATABASE_URL", { infer: true }),
      }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
