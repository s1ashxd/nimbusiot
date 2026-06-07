import { Module } from "@nestjs/common";
import { DevicesController } from "./devices.controller";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule],
  controllers: [DevicesController],
})
export class DevicesModule {}
