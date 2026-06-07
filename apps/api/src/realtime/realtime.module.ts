import { Global, Module } from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway";
import { RealtimeBrokerService } from "./realtime-broker.service";

@Global()
@Module({
  providers: [RealtimeGateway, RealtimeBrokerService],
  exports: [RealtimeBrokerService],
})
export class RealtimeModule {}
