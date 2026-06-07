import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("activity")
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query("level") level?: string,
    @Query("scope") scope?: string,
    @Query("q") q?: string,
    @Query("page") pageStr = "0",
    @Query("size") sizeStr = "50",
  ) {
    const page = Number(pageStr) || 0;
    const size = Math.min(Number(sizeStr) || 50, 200);
    const where: any = {};
    if (level) where.level = { in: level.split(",") as any };
    if (scope) where.scope = { in: scope.split(",") as any };
    if (q) where.message = { contains: q, mode: "insensitive" };
    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { ts: "desc" },
        skip: page * size,
        take: size,
      }),
      this.prisma.activityLog.count({ where }),
    ]);
    return {
      items: items.map((a) => ({
        id: a.id.toString(),
        ts: a.ts.toISOString(),
        level: a.level,
        scope: a.scope,
        deviceId: a.deviceId,
        actorId: a.actorId,
        message: a.message,
      })),
      total,
      page,
      size,
    };
  }
}
