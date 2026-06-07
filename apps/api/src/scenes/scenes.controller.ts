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
  UseGuards,
} from "@nestjs/common";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { PrismaService } from "../common/prisma/prisma.service";
import { RealtimeBrokerService } from "../realtime/realtime-broker.service";

class CreateSceneDto {
  @IsString() name!: string;
  @IsString() icon!: string;
  @IsString() color!: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
}

class UpdateSceneDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
}

function toSceneDto(s: any) {
  return {
    id: s.id,
    name: s.name,
    icon: s.icon,
    color: s.color,
    enabled: s.enabled,
    trigger: s.rules?.[0]?.name ?? "Manual",
    actionsCount: s.rules?.reduce((sum: number, r: any) => sum + (r.actions?.length ?? 0), 0) ?? 0,
    runs24h: 0,
  };
}

@Controller("scenes")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScenesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly broker: RealtimeBrokerService,
  ) {}

  @Get()
  async list() {
    const items = await this.prisma.scene.findMany({
      include: { rules: { include: { actions: true } } },
      orderBy: { createdAt: "asc" },
    });
    return { items: items.map(toSceneDto), total: items.length };
  }

  @Post()
  @Roles("operator", "admin")
  async create(@Body() body: CreateSceneDto) {
    const s = await this.prisma.scene.create({ data: body, include: { rules: { include: { actions: true } } } });
    return toSceneDto(s);
  }

  @Patch(":id")
  @Roles("operator", "admin")
  async update(@Param("id") id: string, @Body() body: UpdateSceneDto) {
    const s = await this.prisma.scene.update({
      where: { id },
      data: body,
      include: { rules: { include: { actions: true } } },
    });
    await this.broker.publish({ type: "scene.update", scene: toSceneDto(s) });
    return toSceneDto(s);
  }

  @Post(":id/toggle")
  @Roles("operator", "admin")
  async toggle(@Param("id") id: string) {
    const cur = await this.prisma.scene.findUniqueOrThrow({ where: { id } });
    const s = await this.prisma.scene.update({
      where: { id },
      data: { enabled: !cur.enabled },
      include: { rules: { include: { actions: true } } },
    });
    await this.broker.publish({ type: "scene.update", scene: toSceneDto(s) });
    return toSceneDto(s);
  }

  @Post(":id/run")
  @Roles("operator", "admin")
  @HttpCode(HttpStatus.OK)
  async run(@Param("id") id: string) {
    const s = await this.prisma.scene.findUniqueOrThrow({ where: { id } });
    await this.prisma.activityLog.create({
      data: { level: "info", scope: "automation", message: `Сценарий «${s.name}» запущен вручную` },
    });
    return { ok: true };
  }

  @Delete(":id")
  @Roles("admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.prisma.scene.delete({ where: { id } });
  }
}
