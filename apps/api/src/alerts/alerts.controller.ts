import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { PrismaService } from "../common/prisma/prisma.service";
import { RealtimeBrokerService } from "../realtime/realtime-broker.service";
import { IsOptional, IsString } from "class-validator";

class AckDto {
  @IsOptional() @IsString() comment?: string;
}

function toAlertDto(a: any) {
  const startedAt: Date = a.startedAt;
  const ended = a.resolvedAt ?? a.acknowledgedAt ?? new Date();
  return {
    id: a.id,
    level: a.level,
    status: a.status,
    title: a.title,
    description: a.description,
    device: a.device
      ? { id: a.device.id, name: a.device.name, room: { id: a.device.room.id, name: a.device.room.name } }
      : null,
    startedAt: startedAt.toISOString(),
    acknowledgedAt: a.acknowledgedAt?.toISOString() ?? null,
    acknowledgedBy: a.acknowledgedBy,
    resolvedAt: a.resolvedAt?.toISOString() ?? null,
    resolvedBy: a.resolvedBy,
    durationSeconds: Math.max(0, Math.floor((ended.getTime() - startedAt.getTime()) / 1000)),
  };
}

@Controller("alerts")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly broker: RealtimeBrokerService,
  ) {}

  @Get()
  async list(@Query("status") status?: string) {
    const where: any = {};
    if (status) where.status = { in: status.split(",") as any };
    const items = await this.prisma.alert.findMany({
      where,
      include: { device: { include: { room: true } } },
      orderBy: { startedAt: "desc" },
      take: 200,
    });
    return { items: items.map(toAlertDto), total: items.length };
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    const a = await this.prisma.alert.findUniqueOrThrow({
      where: { id },
      include: { device: { include: { room: true } }, events: { orderBy: { at: "asc" } } },
    });
    return { ...toAlertDto(a), events: a.events };
  }

  @Post(":id/ack")
  @Roles("operator", "admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  async ack(@Param("id") id: string, @Body() body: AckDto, @CurrentUser() user: AuthUser) {
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.alert.update({
        where: { id },
        data: { status: "ack", acknowledgedAt: new Date(), acknowledgedBy: user.id },
      });
      await tx.alertEvent.create({ data: { alertId: id, event: "ack", comment: body.comment ?? null, actorId: user.id } });
      return tx.alert.findUniqueOrThrow({ where: { id }, include: { device: { include: { room: true } } } });
    });
    await this.broker.publish({ type: "alert.ack", alert: toAlertDto(updated) });
  }

  @Post(":id/resolve")
  @Roles("operator", "admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  async resolve(@Param("id") id: string, @Body() body: AckDto, @CurrentUser() user: AuthUser) {
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.alert.update({
        where: { id },
        data: { status: "resolved", resolvedAt: new Date(), resolvedBy: user.id },
      });
      await tx.alertEvent.create({ data: { alertId: id, event: "resolved", comment: body.comment ?? null, actorId: user.id } });
      return tx.alert.findUniqueOrThrow({ where: { id }, include: { device: { include: { room: true } } } });
    });
    await this.broker.publish({ type: "alert.resolved", alert: toAlertDto(updated) });
  }

  @Post("mark-all-read")
  @Roles("operator", "admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAll(@CurrentUser() user: AuthUser) {
    await this.prisma.alert.updateMany({
      where: { status: "firing" },
      data: { status: "ack", acknowledgedAt: new Date(), acknowledgedBy: user.id },
    });
  }
}
