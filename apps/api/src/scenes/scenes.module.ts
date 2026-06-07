import { Module } from "@nestjs/common";
import { ScenesController } from "./scenes.controller";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule],
  controllers: [ScenesController],
})
export class ScenesModule {}
