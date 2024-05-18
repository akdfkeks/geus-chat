import { Injectable, NotFoundException } from '@nestjs/common';
import * as ER from 'src/common/error/rest/expected';
import { ErrorUtil } from 'src/common/util/error.util';
import { PrismaService } from 'src/service/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findUserById(id: string) {
    return this.prisma.gh_User
      .findUnique({ where: { id: BigInt(id) } })
      .then((rst) => ({ ...rst, id }))
      .catch((e) => {
        throw ErrorUtil.notFound(ER.NO_SUCH_USER);
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
