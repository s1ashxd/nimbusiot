import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("summary")
  async summary() {
    const [groupStatus, alertsFiring, energySum, devCount] = await Promise.all([
      this.prisma.device.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.alert.count({ where: { status: "firing" } }),
      this.prisma.$queryRawUnsafe<Array<{ sum: number | null }>>(
        `SELECT COALESCE(SUM(value), 0)::float8 AS sum FROM telemetry WHERE metric = 'power' AND ts > now() - interval '1 day'`,
      ).catch(() => [{ sum: 0 }]),
      this.prisma.device.count(),
    ]);
    let online = 0;
    let warning = 0;
    let offline = 0;
    for (const g of groupStatus) {
      if (g.status === "online") online = g._count._all;
      if (g.status === "warn" || g.status === "err") warning += g._count._all;
      if (g.status === "offline") offline = g._count._all;
    }
    const energyWh = Number(energySum[0]?.sum ?? 0);
    return {
      deviceCount: devCount,
      online,
      warning,
      offline,
      alertsFiring,
      energyKwh: Math.round((energyWh / 1000) * 10) / 10,
      weatherTempC: null,
    };
  }

  @Get("energy-by-room")
  async energyByRoom() {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ room: string; kw: number }>>(
      `SELECT r.name AS room, COALESCE(AVG(t.value), 0)::float8 / 1000 AS kw
       FROM rooms r
       LEFT JOIN devices d ON d."roomId" = r.id
       LEFT JOIN telemetry t ON t."deviceId" = d.id AND t.metric = 'power' AND t.ts > now() - interval '1 day'
       GROUP BY r.name
       ORDER BY r.name`,
    ).catch(() => []);
    return rows.map((r) => ({ room: r.room, kw: Math.round(Number(r.kw) * 100) / 100 }));
  }

  @Get("energy-trend")
  async energyTrend() {
    const rows = await this.prisma.$queryRawUnsafe<Array<{ bucket: Date; kw: number }>>(
      `SELECT date_trunc('hour', ts) AS bucket,
              COALESCE(AVG(value), 0)::float8 / 1000 AS kw
       FROM telemetry
       WHERE metric = 'power' AND ts > now() - interval '24 hours'
       GROUP BY bucket
       ORDER BY bucket ASC`,
    ).catch(() => []);
    return rows.map((r) => ({
      t: new Date(r.bucket).toISOString(),
      kw: Math.round(Number(r.kw) * 100) / 100,
    }));
  }
}
