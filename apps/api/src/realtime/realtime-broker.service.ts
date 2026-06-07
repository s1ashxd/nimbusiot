import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter } from "events";
import { RedisService } from "../common/redis/redis.service";
import type { WsFrame } from "@nimbus/shared-types";

const CHANNEL = "nimbus:frames";

@Injectable()
export class RealtimeBrokerService {
  private readonly log = new Logger(RealtimeBrokerService.name);
  readonly local = new EventEmitter();
  private subscribed = false;

  constructor(private readonly redis: RedisService) {}

  async publish(frame: WsFrame): Promise<void> {
    const payload = JSON.stringify(frame);
    if (this.redis.ready) {
      try {
        await this.redis.pub.publish(CHANNEL, payload);
        return;
      } catch (err) {
        this.log.warn(`Redis publish failed, falling back to local: ${(err as Error).message}`);
      }
    }
    this.local.emit("frame", frame);
  }

  async subscribeFanout(handler: (frame: WsFrame) => void): Promise<void> {
    if (this.redis.ready && !this.subscribed) {
      try {
        await this.redis.sub.subscribe(CHANNEL);
        this.redis.sub.on("message", (ch, msg) => {
          if (ch !== CHANNEL) return;
          try {
            handler(JSON.parse(msg) as WsFrame);
          } catch {
            /* noop */
          }
        });
        this.subscribed = true;
      } catch (err) {
        this.log.warn(`Redis subscribe failed: ${(err as Error).message}`);
      }
    }
    this.local.on("frame", handler);
  }
}
