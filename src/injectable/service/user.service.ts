import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  public async getUserNickAndTypeByUserId(userId: number) {
    const r = await this.prisma.gh_User.findUniqueOrThrow({ where: { user_id: userId } });
    return { nickname: r.nickname, socialType: r.user_type };
  }
}
