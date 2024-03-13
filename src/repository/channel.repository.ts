import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SnowFlake } from 'src/common/util/snowflake';
import { PrismaService } from 'src/service/prisma.service';
import { Channel } from 'src/structure/channel';
import { ICreateMemberInChannelResult, IFindChannelMemberResult, IFindChannelResult } from 'src/structure/dto/Channel';

@Injectable()
export class ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getChannelById(channelId: string): Promise<IFindChannelResult> {
    return this.prisma.gh_ChannelInfo
      .findUniqueOrThrow({ where: { id: BigInt(channelId) } })
      .then((rst) => {
        return {
          id: rst.id,
          name: rst.name,
          icon_url: rst.icon_url || '',
          owner_id: rst.owner_id,
        };
      })
      .catch((e) => {
        throw new InternalServerErrorException({
          code: '123-123',
          title: 'Internal server exception',
          message: '',
        });
      });
  }

  public async createChannel(owner: string, name: string) {
    return this.prisma.gh_ChannelInfo
      .create({
        data: {
          id: SnowFlake.generate(),
          name,
          owner: { connect: { id: BigInt(owner) } },
          members: { create: { user_id: BigInt(owner) } },
        },
      })
      .then((rst) => {
        return {
          id: rst.id,
          name: rst.name,
        };
      });
  }

  public async findJoinedChannelsIdByUserId(userId: string) {
    return this.prisma.gh_MemberInChannel
      .findMany({
        where: { user_id: BigInt(userId) },
        select: { channel_id: true },
      })
      .then((rst) => {
        return rst.map((mic) => mic.channel_id.toString()) satisfies string[];
      });
  }

  public async findJoinedChannelsByUserId(userId: bigint) {
    return this.prisma.gh_MemberInChannel
      .findMany({
        where: { user_id: userId },
        include: { channel: { include: { _count: { select: { members: true } } } } },
      })
      .then((rst) =>
        rst.map((c) => {
          return {
            id: c.channel_id,
            name: c.channel.name,
            icon_url: '',
            member_count: c.channel._count.members,
          } satisfies Channel.DetailDto;
        }),
      );
  }

  public async addMemberToChannel(userId: string, channelId: string): Promise<ICreateMemberInChannelResult> {
    return this.prisma.gh_MemberInChannel
      .upsert({
        where: { user_id_channel_id: { user_id: BigInt(userId), channel_id: BigInt(channelId) } },
        update: {},
        create: { user_id: BigInt(userId), channel_id: BigInt(channelId), user_role: UserRole.GUEST },
      })
      .then((rst) => {
        return {
          userId: userId,
          channelId: channelId,
        };
      });
  }

  public async findChannelMembers(channelId: bigint) {
    return this.prisma.gh_MemberInChannel
      .findMany({
        where: { channel_id: channelId },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
            },
          },
        },
      })
      .then((rst) =>
        rst.map(({ user, user_role }) => {
          return {
            id: user.id,
            role: user_role,
            name: user.nickname,
            avatar_url: user.avatar_url || '',
          } satisfies IFindChannelMemberResult;
        }),
      );
  }
}
