import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/service/prisma.service';

@Injectable()
export class ChannelMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findChannelMembers(channelId: string) {
    const members = await this.prisma.gh_MemberInChannel.findMany({
      where: { channel_id: channelId },
      include: {
        user: {
          select: {
            nickname: true,
            user_id: true,
            user_type: true,
          },
        },
      },
    });
    return members.map(({ user }) => {
      return { id: user.user_id, type: user.user_type, nickname: user.nickname };
    });
  }
}
