import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma/prisma.service";
import { RealtimeBrokerService } from "../realtime/realtime-broker.service";
import { SeededRandom } from "./seeded-random";

const METRIC_BY_TYPE: Record<string, string[]> = {
  thermo: ["temp", "humidity", "battery"],
  light: ["power", "level"],
  lock: ["battery"],
  camera: ["rssi", "motion"],
  motion: ["battery", "rssi"],
  smoke: ["battery", "co2"],
  energy: ["power"],
  fan: ["power", "level"],
  hub: ["rssi"],
};

@Injectable()
export class MockGeneratorService implements OnModuleInit {
  private readonly log = new Logger(MockGeneratorService.name);
  private rng!: SeededRandom;
  private enabled = true;

  constructor(
    private readonly prisma: PrismaService,
    private readonly broker: RealtimeBrokerService,
    private readonly cfg: ConfigService,
  ) {}

  onModuleInit() {
    this.enabled = (this.cfg.get<string>("MOCK_ENABLED") ?? "true") !== "false";
    const seed = Number(this.cfg.get<string>("MOCK_SEED") ?? 42);
    this.rng = new SeededRandom(seed);
    this.log.log(`Mock generator: enabled=${this.enabled}, seed=${seed}`);
  }

  @Cron("*/4 * * * * *")
  async tickFast() {
    if (!this.enabled) return;
    try {
      const devices = await this.prisma.device.findMany({
        where: { status: { in: ["online", "warn"] } },
        select: { id: true, type: true },
      });
      const now = new Date();
      const samples: Array<{ deviceId: string; metric: string; value: number; ts: Date }> = [];
      for (const d of devices) {
        const metrics = METRIC_BY_TYPE[d.type] ?? ["state"];
        for (const m of metrics) {
          const v = this.valueFor(m);
          samples.push({ deviceId: d.id, metric: m, value: v, ts: now });
          await this.broker.publish({
            type: "telemetry",
            deviceId: d.id,
            metric: m,
            ts: now.toISOString(),
            value: v,
          });
        }
      }
      if (samples.length > 0) {
        await this.prisma.telemetry.createMany({ data: samples });
      }
    } catch (err) {
      this.log.warn(`tickFast failed: ${(err as Error).message}`);
    }
  }

  @Cron("*/30 * * * * *")
  async tickMedium() {
    if (!this.enabled) return;
    try {
      const messages = [
        { level: "info" as const, scope: "system" as const, message: "Резервная копия конфигурации создана" },
        { level: "ok" as const, scope: "network" as const, message: "Mesh-сеть стабильна, средняя задержка 8 мс" },
        { level: "info" as const, scope: "automation" as const, message: "Сценарий «Энергосбережение» применён" },
      ];
      const m = messages[this.rng.int(0, messages.length - 1)];
      await this.prisma.activityLog.create({ data: m });
    } catch (err) {
      this.log.warn(`tickMedium failed: ${(err as Error).message}`);
    }
  }

  private valueFor(metric: string): number {
    switch (metric) {
      case "temp":
        return Math.round((20 + this.rng.range(-2, 4)) * 10) / 10;
      case "humidity":
        return Math.round(40 + this.rng.range(-5, 10));
      case "power":
        return Math.round(this.rng.range(20, 1500));
      case "level":
        return Math.round(this.rng.range(0, 100));
      case "co2":
        return Math.round(this.rng.range(400, 900));
      case "rssi":
        return Math.round(this.rng.range(-80, -40));
      case "motion":
        return this.rng.next() > 0.85 ? 1 : 0;
      case "battery":
        return Math.round(this.rng.range(40, 100));
      default:
        return Math.round(this.rng.range(0, 1) * 100) / 100;
    }
  }
}
