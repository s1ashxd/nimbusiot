import { Module } from "@nestjs/common";
import { AlertsController } from "./alerts.controller";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule],
  controllers: [AlertsController],
})
export class AlertsModule {}
