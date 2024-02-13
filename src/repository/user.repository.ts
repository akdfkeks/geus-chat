import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/service/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findUserById(id: number) {
    return this.prisma.gh_User.findUniqueOrThrow({
      where: { user_id: id },
    });
  }

  public async findUserByEmail(email: string) {
    return this.prisma.gh_User.findUnique({ where: { email } });
  }

  public async upsertChannelRefreshToken(userId: number, refreshToken: string) {
    return this.prisma.gh_Channel_Token.upsert({
      where: { user_id: userId },
      create: { user_id: userId, refresh_token: refreshToken },
      update: { refresh_token: refreshToken },
    });
  }

  public async findRefreshTokenByUserId(userId: number) {
    return this.prisma.gh_Channel_Token.findUnique({ where: { user_id: userId } });
  }
}
