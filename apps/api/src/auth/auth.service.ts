import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../common/prisma/prisma.service";
import type { Role, JwtPayload } from "./auth.types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new UnauthorizedException("invalid-credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("invalid-credentials");

    const roles = user.roles.map((r) => r.roleId as Role);
    const payload: JwtPayload = { sub: user.id, roles };
    const ttl = this.cfg.get<string>("JWT_TTL") ?? "24h";
    const accessToken = this.jwt.sign(payload, { algorithm: "HS256", expiresIn: ttl });
    const expiresAt = new Date(Date.now() + ttlToMs(ttl)).toISOString();

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        roles,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
      expiresAt,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      roles: user.roles.map((r) => r.roleId as Role),
      createdAt: user.createdAt.toISOString(),
    };
  }

  async changePassword(userId: string, current: string, next: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const ok = await bcrypt.compare(current, user.passwordHash);
    if (!ok) throw new UnauthorizedException("invalid-credentials");
    const hash = await bcrypt.hash(next, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
  }
}

function ttlToMs(ttl: string): number {
  const m = /^(\d+)([smhd])$/.exec(ttl);
  if (!m) return 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const unit = m[2];
  if (unit === "s") return n * 1000;
  if (unit === "m") return n * 60_000;
  if (unit === "h") return n * 3_600_000;
  return n * 86_400_000;
}
