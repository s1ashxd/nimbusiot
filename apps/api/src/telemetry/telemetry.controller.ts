import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("telemetry")
@UseGuards(JwtAuthGuard)
export class TelemetryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("latest")
  async latest(@Query("deviceId") deviceId?: string) {
    const rows = deviceId
      ? await this.prisma.$queryRawUnsafe<Array<{ deviceId: string; metric: string; value: number; ts: Date }>>(
          `SELECT DISTINCT ON ("deviceId", metric) "deviceId", metric, value, ts FROM telemetry WHERE "deviceId" = $1 ORDER BY "deviceId", metric, ts DESC LIMIT 500`,
          deviceId,
        ).catch(() => [])
      : await this.prisma.$queryRawUnsafe<Array<{ deviceId: string; metric: string; value: number; ts: Date }>>(
          `SELECT DISTINCT ON ("deviceId", metric) "deviceId", metric, value, ts FROM telemetry ORDER BY "deviceId", metric, ts DESC LIMIT 500`,
        ).catch(() => []);
    return rows.map((r) => ({ deviceId: r.deviceId, metric: r.metric, value: Number(r.value), ts: r.ts.toISOString() }));
  }

  @Get("timeseries")
  async timeseries(
    @Query("deviceId") deviceId: string,
    @Query("metric") metric: string,
    @Query("range") range = "1h",
  ) {
    const ms = rangeToMs(range);
    const from = new Date(Date.now() - ms);
    const metrics = (metric ?? "").split(",").filter(Boolean);
    const deviceIds = (deviceId ?? "").split(",").filter(Boolean);
    const series = [] as Array<{ metric: string; deviceId: string; points: Array<{ t: string; v: number }> }>;
    for (const did of deviceIds) {
      for (const m of metrics) {
        const rows = await this.prisma.telemetry.findMany({
          where: { deviceId: did, metric: m, ts: { gte: from } },
          orderBy: { ts: "asc" },
          take: 1000,
        });
        series.push({
          metric: m,
          deviceId: did,
          points: rows.map((r) => ({ t: r.ts.toISOString(), v: Number(r.value) })),
        });
      }
    }
    return {
      range: { from: from.toISOString(), to: new Date().toISOString() },
      step: bucketForRange(range),
      series,
    };
  }
}

function rangeToMs(r: string): number {
  const m = /^(\d+)([smhd])$/.exec(r);
  if (!m) return 60 * 60_000;
  const n = Number(m[1]);
  const unit = m[2];
  if (unit === "s") return n * 1000;
  if (unit === "m") return n * 60_000;
  if (unit === "h") return n * 3_600_000;
  return n * 86_400_000;
}

function bucketForRange(r: string): string {
  if (r.endsWith("h")) return "1m";
  if (r === "24h") return "30m";
  if (r.endsWith("d")) return "1h";
  return "1m";
}
