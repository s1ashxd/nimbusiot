import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("rules")
@UseGuards(JwtAuthGuard)
export class RulesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query("sceneId") sceneId?: string) {
    const where = sceneId ? { sceneId } : {};
    const items = await this.prisma.automationRule.findMany({
      where,
      include: { actions: { orderBy: { ord: "asc" } } },
      orderBy: { priority: "asc" },
    });
    return {
      items: items.map((r) => ({
        id: r.id,
        name: r.name,
        sceneId: r.sceneId,
        enabled: r.enabled,
        priority: r.priority,
        trigger: r.trigger,
        conditions: r.conditions,
        actions: r.actions.map((a) => ({ ord: a.ord, kind: a.kind, targetDeviceId: a.targetDeviceId, payload: a.payload })),
      })),
      total: items.length,
    };
  }
}
