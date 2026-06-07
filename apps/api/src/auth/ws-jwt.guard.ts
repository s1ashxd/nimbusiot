import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { IncomingMessage } from "http";
import type { JwtPayload, AuthUser } from "./auth.types";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const client = ctx.switchToWs().getClient() as { data?: { user: AuthUser }; upgradeReq?: IncomingMessage };
    const req = client.upgradeReq ?? (ctx.switchToHttp().getRequest() as IncomingMessage | undefined);
    const urlStr = req?.url ?? "";
    let token: string | null = null;
    try {
      token = new URL(urlStr, "http://localhost").searchParams.get("token");
    } catch {
      token = null;
    }
    if (!token) return false;
    try {
      const payload = this.jwt.verify<JwtPayload>(token, { algorithms: ["HS256"] });
      client.data = { user: { id: payload.sub, roles: payload.roles ?? [] } };
      return true;
    } catch {
      return false;
    }
  }
}
