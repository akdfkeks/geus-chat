import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/service/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findUserById(id: string) {
    return this.prisma.gh_User.findUniqueOrThrow({
      where: { id: BigInt(id) },
    });
  }

  public async findUserByEmail(email: string) {
    return this.prisma.gh_User
      .findUniqueOrThrow({ where: { email } })
      .then((rst) => {
        return { ...rst, id: rst.id.toString() };
      })
      .catch((e) => {
        throw new NotFoundException();
      });
  }

  public async upsertChannelRefreshToken(id: string, refreshToken: string) {
    return this.prisma.gh_Channel_Token.upsert({
      where: { user_id: BigInt(id) },
      create: { user_id: BigInt(id), refresh_token: refreshToken },
      update: { refresh_token: refreshToken },
    });
  }

  public async findRefreshTokenByUserId(id: string) {
    return this.prisma.gh_Channel_Token.findUnique({ where: { user_id: BigInt(id) } });
  }
}
