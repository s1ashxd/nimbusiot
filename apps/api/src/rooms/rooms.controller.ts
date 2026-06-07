import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("rooms")
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const rooms = await this.prisma.room.findMany({
      include: { _count: { select: { devices: true } } },
      orderBy: { name: "asc" },
    });
    return rooms.map((r) => ({
      id: r.id,
      name: r.name,
      floor: r.floor,
      area: r.area,
      deviceCount: r._count.devices,
    }));
  }
}
