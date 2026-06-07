import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("settings")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get() {
    const hub = await this.prisma.device.findUnique({ where: { id: "DEV-HUB1" } });
    return {
      hub: hub
        ? {
            id: hub.id,
            name: hub.name,
            status: hub.status,
            fw: hub.fw,
            lastSeenAt: hub.lastSeenAt.toISOString(),
          }
        : null,
      flags: {
        autoUpdates: true,
        twoFactor: false,
        telemetryRetentionDays: 7,
      },
    };
  }

  @Patch()
  @Roles("admin")
  async patch(@Body() body: { hub?: { name?: string } }) {
    if (body.hub?.name) {
      await this.prisma.device.update({ where: { id: "DEV-HUB1" }, data: { name: body.hub.name } });
    }
    return this.get();
  }
}
