import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { PrismaService } from "../common/prisma/prisma.service";
import { RealtimeBrokerService } from "../realtime/realtime-broker.service";
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

class ListDevicesQuery {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() room?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() sort?: string;
  @IsOptional() @IsInt() @Min(0) page?: number;
  @IsOptional() @IsInt() @Min(1) @Max(200) size?: number;
}

class UpdateDeviceDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() roomId?: string;
  @IsOptional() @IsString() warnText?: string | null;
}

function toDto(d: any) {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    room: { id: d.room.id, name: d.room.name },
    status: d.status,
    battery: d.battery,
    signal: d.signal,
    valueText: d.valueText,
    unit: d.unit,
    fw: d.fw,
    warnText: d.warnText,
    lastSeenAt: d.lastSeenAt.toISOString(),
    metricsLatest: d.metricsLatest ?? {},
  };
}

@Controller("devices")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly broker: RealtimeBrokerService,
  ) {}

  @Get()
  async list(@Query() q: ListDevicesQuery) {
    const where: any = {};
    if (q.status) where.status = { in: q.status.split(",") };
    if (q.room) where.room = { name: q.room };
    if (q.type) where.type = { in: q.type.split(",") as any };
    if (q.q) where.OR = [{ name: { contains: q.q, mode: "insensitive" } }, { id: { contains: q.q } }];

    const size = q.size ?? 50;
    const page = q.page ?? 0;
    const [items, total] = await Promise.all([
      this.prisma.device.findMany({
        where,
        include: { room: true },
        orderBy: { name: "asc" },
        skip: page * size,
        take: size,
      }),
      this.prisma.device.count({ where }),
    ]);
    // attach latest telemetry per device (single-pass)
    const ids = items.map((i) => i.id);
    const latest = await this.prisma.$queryRawUnsafe<Array<{ deviceId: string; metric: string; value: number }>>(
      `SELECT DISTINCT ON ("deviceId", metric) "deviceId", metric, value FROM telemetry WHERE "deviceId" = ANY($1::text[]) ORDER BY "deviceId", metric, ts DESC`,
      ids,
    ).catch(() => []);
    const byId: Record<string, Record<string, number>> = {};
    for (const row of latest) {
      byId[row.deviceId] ??= {};
      byId[row.deviceId][row.metric] = Number(row.value);
    }
    return {
      items: items.map((d) => toDto({ ...d, metricsLatest: byId[d.id] ?? {} })),
      total,
      page,
      size,
    };
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    const d = await this.prisma.device.findUniqueOrThrow({
      where: { id },
      include: { room: true },
    });
    const latest = await this.prisma.$queryRawUnsafe<Array<{ metric: string; value: number }>>(
      `SELECT DISTINCT ON (metric) metric, value FROM telemetry WHERE "deviceId" = $1 ORDER BY metric, ts DESC`,
      id,
    ).catch(() => []);
    const metricsLatest: Record<string, number> = {};
    for (const row of latest) metricsLatest[row.metric] = Number(row.value);
    return toDto({ ...d, metricsLatest });
  }

  @Patch(":id")
  @Roles("operator", "admin")
  async update(@Param("id") id: string, @Body() body: UpdateDeviceDto) {
    const updated = await this.prisma.device.update({
      where: { id },
      data: body,
      include: { room: true },
    });
    await this.broker.publish({ type: "device.update", device: toDto(updated) });
    return toDto(updated);
  }

  @Post(":id/poll")
  @Roles("operator", "admin")
  @HttpCode(HttpStatus.OK)
  async poll(@Param("id") id: string) {
    const updated = await this.prisma.device.update({
      where: { id },
      data: { lastSeenAt: new Date() },
      include: { room: true },
    });
    await this.broker.publish({ type: "device.update", device: toDto(updated) });
    return { ok: true, lastSeenAt: updated.lastSeenAt.toISOString() };
  }

  @Post(":id/restart")
  @Roles("admin")
  @HttpCode(HttpStatus.OK)
  async restart(@Param("id") id: string) {
    await this.prisma.activityLog.create({
      data: { level: "info", scope: "device", deviceId: id, message: `Перезапуск устройства ${id}` },
    });
    return { ok: true };
  }

  @Delete(":id")
  @Roles("admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.prisma.device.delete({ where: { id } });
  }
}
