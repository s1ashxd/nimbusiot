import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const users = await this.prisma.user.findMany({
      include: { roles: true },
      orderBy: { createdAt: "asc" },
    });
    return {
      items: users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        avatar: u.avatar,
        roles: u.roles.map((r) => r.roleId),
        createdAt: u.createdAt.toISOString(),
      })),
      total: users.length,
    };
  }
}
