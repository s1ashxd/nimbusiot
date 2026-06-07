import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("integrations")
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const items = await this.prisma.integration.findMany({ orderBy: { kind: "asc" } });
    return items.map((i) => ({ kind: i.kind, enabled: i.enabled, updatedAt: i.updatedAt.toISOString() }));
  }

  @Patch(":kind")
  @Roles("admin")
  async patch(@Param("kind") kind: string, @Body() body: { enabled?: boolean; config?: Record<string, unknown> }) {
    const updated = await this.prisma.integration.upsert({
      where: { kind },
      update: {
        enabled: body.enabled ?? undefined,
        config: body.config !== undefined ? (body.config as any) : undefined,
      },
      create: { kind, enabled: body.enabled ?? false, config: (body.config ?? {}) as any },
    });
    return { kind: updated.kind, enabled: updated.enabled, updatedAt: updated.updatedAt.toISOString() };
  }
}
