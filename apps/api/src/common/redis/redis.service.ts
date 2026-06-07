import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(RedisService.name);
  private _pub!: Redis;
  private _sub!: Redis;
  private _ready = false;

  constructor(private readonly cfg: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.cfg.get<string>("REDIS_URL") ?? "redis://localhost:6379";
    this._pub = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 });
    this._sub = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 });
    try {
      await this._pub.connect();
      await this._sub.connect();
      this._ready = true;
      this.log.log("Redis connected");
    } catch (err) {
      this.log.warn(`Redis connection failed: ${(err as Error).message}. Continuing in degraded mode.`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try { await this._pub?.quit(); } catch { /* noop */ }
    try { await this._sub?.quit(); } catch { /* noop */ }
  }

  get pub(): Redis {
    return this._pub;
  }

  get sub(): Redis {
    return this._sub;
  }

  get ready(): boolean {
    return this._ready;
  }

  async ping(): Promise<boolean> {
    try {
      const r = await this._pub.ping();
      return r === "PONG";
    } catch {
      return false;
    }
  }
}
