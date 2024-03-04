import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/service/prisma.service';
import { IFindChannelMemberResult } from 'src/structure/dto/Channel';

@Injectable()
export class ChannelMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findChannelMembers(channelId: string) {
    return this.prisma.gh_MemberInChannel
      .findMany({
        where: { channel_id: BigInt(channelId) },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              user_type: true,
            },
          },
        },
      })
      .then((rst) =>
        rst.map(({ user }) => {
          return {
            id: user.id.toString(),
            nickname: user.nickname,
          } satisfies IFindChannelMemberResult;
        }),
      );
  }
}
