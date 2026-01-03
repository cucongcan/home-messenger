import { Injectable } from '@nestjs/common';
import { PrismaService } from '@vendors/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }
}
