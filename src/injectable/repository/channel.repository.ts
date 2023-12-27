import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/injectable/service/prisma.service';
import { ulid } from 'ulidx';

@Injectable()
export class ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getChannelById(channelId: string) {
    return this.prisma.gh_ChannelInfo.findUnique({ where: { id: channelId } });
  }

  public async createChannel(owner: string, name: string) {
    return this.prisma.gh_ChannelInfo.create({
      data: {
        id: ulid(),
        name,
        owner: { connect: { email: owner } },
        members: { create: { user_email: owner } },
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

  public async getJoinedChannelsIdByEmail(email: string) {
    const rst = await this.prisma.gh_MemberInChannel.findMany({
      where: { user_email: email },
      select: { channel_id: true },
    });
    return rst.map((c) => c.channel_id);
  }

  public async getJoinedChannelListByEmail(email: string) {
    const rst = await this.prisma.gh_MemberInChannel.findMany({
      where: { user_email: email },
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

  public async addMemberToChannel(userEmail: string, channelId: string) {
    return this.prisma.gh_MemberInChannel.upsert({
      where: { user_email_channel_id: { user_email: userEmail, channel_id: channelId } },
      update: {},
      create: { user_email: userEmail, channel_id: channelId },
    });
  }
}
