import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import * as Joi from "joi";

import { PrismaModule } from "./common/prisma/prisma.module";
import { RedisModule } from "./common/redis/redis.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { RoomsModule } from "./rooms/rooms.module";
import { DevicesModule } from "./devices/devices.module";
import { TelemetryModule } from "./telemetry/telemetry.module";
import { AlertsModule } from "./alerts/alerts.module";
import { ScenesModule } from "./scenes/scenes.module";
import { RulesModule } from "./rules/rules.module";
import { ActivityModule } from "./activity/activity.module";
import { SettingsModule } from "./settings/settings.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { IngestModule } from "./ingest/ingest.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { MockModule } from "./mock/mock.module";
import { DashboardModule } from "./dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid("development", "production", "test").default("production"),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().default("redis://localhost:6379"),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_TTL: Joi.string().default("24h"),
        INGEST_TOKEN: Joi.string().min(8).required(),
        NIMBUS_DATA_SOURCE: Joi.string().valid("mock", "open-meteo", "hybrid").default("mock"),
        MOCK_SEED: Joi.number().default(42),
        MOCK_RATE: Joi.number().default(1),
        MOCK_ENABLED: Joi.string().default("true"),
        HUB_LATITUDE: Joi.number().default(55.75),
        HUB_LONGITUDE: Joi.number().default(37.62),
        OPEN_METEO_BASE: Joi.string().default("https://api.open-meteo.com"),
        CORS_ORIGINS: Joi.string().default("http://localhost:8080"),
      }),
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RoomsModule,
    DevicesModule,
    TelemetryModule,
    AlertsModule,
    ScenesModule,
    RulesModule,
    ActivityModule,
    SettingsModule,
    IntegrationsModule,
    IngestModule,
    RealtimeModule,
    DashboardModule,
    MockModule,
  ],
})
export class AppModule {}
