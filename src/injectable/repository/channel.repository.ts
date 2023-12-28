import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/injectable/service/prisma.service';
import { ulid } from 'ulidx';

@Injectable()
export class ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getChannelById(channelId: string) {
    return this.prisma.gh_ChannelInfo.findUnique({ where: { id: channelId } });
  }

  public async createChannel(owner: number, name: string) {
    return this.prisma.gh_ChannelInfo.create({
      data: {
        id: ulid(),
        name,
        owner: { connect: { user_id: owner } },
        members: { create: { user_id: owner } },
      },
    });
  }

  public async getJoinedMembersByChannelId(channelId: string) {
    const rst = await this.prisma.gh_MemberInChannel.findMany({
      where: { channel_id: channelId },
      include: { user: true },
    });

    return rst.map(({ user }) => user);
  }

  public async getJoinedChannelsIdByUserId(userId: number) {
    const rst = await this.prisma.gh_MemberInChannel.findMany({
      where: { user_id: userId },
      select: { channel_id: true },
    });
    return rst.map((c) => c.channel_id);
  }

  public async getJoinedChannelListByUserId(userId: number) {
    const rst = await this.prisma.gh_MemberInChannel.findMany({
      where: { user_id: userId },
      include: { channel: true },
    });
    return rst.map((c) => {
      return {
        id: c.channel_id,
        name: c.channel.name,
        owner: c.channel.owner_id,
      };
    });
  }

  public async addMemberToChannel(userId: number, channelId: string) {
    const rst = await this.prisma.gh_MemberInChannel.upsert({
      where: { user_id_channel_id: { user_id: userId, channel_id: channelId } },
      update: {},
      create: { user_id: userId, channel_id: channelId },
    });

    return { channelId: rst.channel_id, userId: rst.user_id };
  }
}
