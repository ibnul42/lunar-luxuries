import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

/**
 * Liveness probe — deliberately dependency-free. It answers "did the process
 * boot and is the event loop responsive", nothing more.
 *
 * When Postgres lands, a *readiness* check that actually probes the connection
 * belongs beside this one (`@nestjs/terminus`), not folded into it: a database
 * outage should fail readiness and drain traffic, not report the process dead
 * and trigger a restart loop.
 *
 * Exempt from rate limiting: probes arrive every few seconds from one address.
 */
@SkipThrottle()
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
