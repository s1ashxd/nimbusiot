import { Module } from "@nestjs/common";
import { MockGeneratorService } from "./mock-generator.service";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule],
  providers: [MockGeneratorService],
})
export class MockModule {}
