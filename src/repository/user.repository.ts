import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/service/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findUserById(id: string) {
    return this.prisma.gh_User
      .findUnique({ where: { id: BigInt(id) } })
      .then((rst) => ({ ...rst, id }))
      .catch((e) => {
        throw new NotFoundException({
          code: '000-000',
          title: '사용자 조회에 실패했습니다.',
          message: '존재하지 않는 사용자입니다.',
        });
      });
  }

  public async findUserByEmail(email: string) {
    return this.prisma.gh_User
      .findUnique({ where: { email } })
      .then((rst) => (rst ? { ...rst, id: rst.id.toString() } : null));
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
