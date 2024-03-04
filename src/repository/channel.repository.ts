import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SnowFlake } from 'src/common/util/snowflake';
import { PrismaService } from 'src/service/prisma.service';
import { ICreateMemberInChannelResult, IFindChannelResult } from 'src/structure/dto/Channel';

@Injectable()
export class ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getChannelById(channelId: string): Promise<IFindChannelResult> {
    return this.prisma.gh_ChannelInfo
      .findUniqueOrThrow({ where: { id: BigInt(channelId) } })
      .then((rst) => {
        return {
          id: rst.id.toString(),
          name: rst.name,
          icon_url: rst.icon_url || '',
          owner_id: rst.owner_id.toString(),
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
          id: rst.id.toString(),
          name: rst.name,
        };
      });
  }

  public async getJoinedChannelsIdByUserId(userId: string) {
    return this.prisma.gh_MemberInChannel
      .findMany({
        where: { user_id: BigInt(userId) },
        select: { channel_id: true },
      })
      .then((rst) => {
        return rst.map((mic) => mic.channel_id.toString()) satisfies string[];
      });
  }

  public async getJoinedChannelListByUserId(
    userId: string,
  ): Promise<Array<Pick<IFindChannelResult, 'id' | 'name' | 'icon_url'>>> {
    return this.prisma.gh_MemberInChannel
      .findMany({
        where: { user_id: BigInt(userId) },
        include: { channel: true },
      })
      .then((rst) =>
        rst.map((c) => {
          return {
            id: c.channel_id.toString(),
            name: c.channel.name,
            icon_url: '',
          };
        }),
      );
  }

  public async addMemberToChannel(userId: string, channelId: string): Promise<ICreateMemberInChannelResult> {
    return this.prisma.gh_MemberInChannel
      .upsert({
        where: { user_id_channel_id: { user_id: BigInt(userId), channel_id: BigInt(channelId) } },
        update: {},
        create: { user_id: BigInt(userId), channel_id: BigInt(channelId) },
      })
      .then((rst) => {
        return {
          userId: userId,
          channelId: channelId,
        };
      });
  }
}
