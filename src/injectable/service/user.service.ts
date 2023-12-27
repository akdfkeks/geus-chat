import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  public async getUserNickAndTypeByEmail(email: string) {
    const r = await this.prisma.gh_User.findUniqueOrThrow({ where: { email: email } });
    return { nickname: r.nickname, socialType: r.user_type };
  }
}
