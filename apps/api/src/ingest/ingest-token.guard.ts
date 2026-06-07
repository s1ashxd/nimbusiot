import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class IngestTokenGuard implements CanActivate {
  constructor(private readonly cfg: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const expected = this.cfg.get<string>("INGEST_TOKEN");
    const got = req.headers["x-ingest-token"];
    if (!expected || !got || got !== expected) return false;
    req.user = { id: "ingest-machine", roles: ["ingest"] };
    return true;
  }
}
