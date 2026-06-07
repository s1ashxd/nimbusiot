import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { IngestTokenGuard } from "./ingest-token.guard";
import { PrismaService } from "../common/prisma/prisma.service";
import { RealtimeBrokerService } from "../realtime/realtime-broker.service";

class TelemetrySample {
  @IsString() deviceId!: string;
  @IsString() metric!: string;
  @IsOptional() @IsString() ts?: string;
  @IsNumber() value!: number;
}

class TelemetryBatch {
  @IsArray() @ValidateNested({ each: true }) @Type(() => TelemetrySample) samples!: TelemetrySample[];
}

class ActivityEntry {
  @IsString() level!: string;
  @IsString() scope!: string;
  @IsOptional() @IsString() deviceId?: string;
  @IsString() message!: string;
}

class ActivityBatch {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ActivityEntry) entries!: ActivityEntry[];
}

class Heartbeat {
  @IsString() deviceId!: string;
  @IsOptional() @IsString() ts?: string;
}

@Controller("ingest")
@UseGuards(IngestTokenGuard)
export class IngestController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly broker: RealtimeBrokerService,
  ) {}

  @Post("telemetry")
  @HttpCode(HttpStatus.NO_CONTENT)
  async telemetry(@Body() body: TelemetryBatch) {
    await this.prisma.telemetry.createMany({
      data: body.samples.map((s) => ({
        deviceId: s.deviceId,
        metric: s.metric,
        value: s.value,
        ts: s.ts ? new Date(s.ts) : new Date(),
      })),
    });
    for (const s of body.samples) {
      await this.broker.publish({
        type: "telemetry",
        deviceId: s.deviceId,
        metric: s.metric,
        ts: s.ts ?? new Date().toISOString(),
        value: s.value,
      });
    }
  }

  @Post("activity")
  @HttpCode(HttpStatus.NO_CONTENT)
  async activity(@Body() body: ActivityBatch) {
    for (const e of body.entries) {
      await this.prisma.activityLog.create({
        data: {
          level: e.level as any,
          scope: e.scope as any,
          deviceId: e.deviceId ?? null,
          message: e.message,
        },
      });
    }
  }

  @Post("heartbeat")
  @HttpCode(HttpStatus.NO_CONTENT)
  async heartbeat(@Body() body: Heartbeat) {
    await this.prisma.device.update({
      where: { id: body.deviceId },
      data: { lastSeenAt: body.ts ? new Date(body.ts) : new Date() },
    });
  }
}
