import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger, OnApplicationShutdown } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { WebSocket, Server } from "ws";
import type { IncomingMessage } from "http";
import { RealtimeBrokerService } from "./realtime-broker.service";
import type { WsFrame } from "@nimbus/shared-types";
import type { JwtPayload } from "../auth/auth.types";

interface AuthedClient extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

@WebSocketGateway({ path: "/ws" })
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnApplicationShutdown
{
  private readonly log = new Logger(RealtimeGateway.name);
  private clients = new Set<AuthedClient>();
  @WebSocketServer() server!: Server;
  private heartbeatTimer?: NodeJS.Timeout;

  constructor(
    private readonly broker: RealtimeBrokerService,
    private readonly jwt: JwtService,
  ) {}

  async afterInit() {
    await this.broker.subscribeFanout((frame) => this.broadcast(frame));
    this.heartbeatTimer = setInterval(() => {
      const beat: WsFrame = { type: "heartbeat", serverTime: new Date().toISOString() };
      for (const c of this.clients) {
        if (c.isAlive === false) {
          c.terminate();
          this.clients.delete(c);
          continue;
        }
        c.isAlive = false;
        try {
          c.ping();
          c.send(JSON.stringify(beat));
        } catch {
          /* noop */
        }
      }
    }, 25_000);
  }

  handleConnection(@ConnectedSocket() client: AuthedClient, req: IncomingMessage) {
    let userId: string | null = null;
    try {
      const url = new URL(req.url ?? "/ws", "http://localhost");
      const token = url.searchParams.get("token");
      if (!token) {
        client.close(4401, "no-token");
        return;
      }
      const payload = this.jwt.verify<JwtPayload>(token, { algorithms: ["HS256"] });
      userId = payload.sub;
    } catch {
      client.close(4401, "invalid-token");
      return;
    }
    client.userId = userId ?? undefined;
    client.isAlive = true;
    client.on("pong", () => (client.isAlive = true));
    client.on("close", () => this.clients.delete(client));
    this.clients.add(client);
    this.log.log(`ws connected (${this.clients.size} total)`);
  }

  handleDisconnect(@ConnectedSocket() client: AuthedClient) {
    this.clients.delete(client);
    this.log.log(`ws disconnected (${this.clients.size} total)`);
  }

  broadcast(frame: WsFrame) {
    const payload = JSON.stringify(frame);
    for (const c of this.clients) {
      try {
        c.send(payload);
      } catch {
        /* noop */
      }
    }
  }

  async onApplicationShutdown() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    const goodbye: WsFrame = { type: "shutdown" };
    const payload = JSON.stringify(goodbye);
    for (const c of this.clients) {
      try {
        c.send(payload);
        c.close();
      } catch {
        /* noop */
      }
    }
    this.clients.clear();
  }
}
