import { Module } from "@nestjs/common";
import { IngestController } from "./ingest.controller";
import { IngestTokenGuard } from "./ingest-token.guard";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [RealtimeModule],
  controllers: [IngestController],
  providers: [IngestTokenGuard],
})
export class IngestModule {}
