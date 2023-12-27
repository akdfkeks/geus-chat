import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/injectable/service/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findUserByEmail(email: string) {
    return this.prisma.gh_User.findUnique({ where: { email } });
  }

  public async upsertChannelRefreshToken(userEmail: string, refreshToken: string) {
    return this.prisma.gh_Channel_Token.upsert({
      where: { user_email: userEmail },
      create: { user_email: userEmail, refresh_token: refreshToken },
      update: { refresh_token: refreshToken },
    });
  }

  public async findRefreshTokenByEmail(email: string) {
    return this.prisma.gh_Channel_Token.findUnique({ where: { user_email: email } });
  }
}
