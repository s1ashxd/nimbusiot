import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { RedisService } from "../common/redis/redis.service";

@Controller({ path: "health", version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async health() {
    const db = await this.prisma.$queryRaw`SELECT 1`.then(() => "ok").catch(() => "fail");
    const redis = (await this.redis.ping()) ? "ok" : "fail";
    const overall = db === "ok" ? "ok" : "degraded";
    return { status: overall, db, redis, ts: new Date().toISOString() };
  }

  @Get("ready")
  async ready() {
    const db = await this.prisma.$queryRaw`SELECT 1`.then(() => "ok").catch(() => "fail");
    const ok = db === "ok";
    return { status: ok ? "ready" : "not-ready", db };
  }
}
