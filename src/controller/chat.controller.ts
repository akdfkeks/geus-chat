import { Body, Controller, Get, HttpCode, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ChannelService } from 'src/injectable/service/channel.service';

@UseFilters()
@UseGuards()
@Controller('/v1/chat')
export class ChatController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('')
  public getJoinedChannels() {
    return '';
  }

  @Get('/:channelId/history')
  public async getChatHistory(@Param('channelId') channelId: string, @Query() lastMessage: string) {
    return {
      channelId,
      lastMessage,
      history: [],
    };
  }

  @Get('/:channelId/sync')
  public async syncChatHistory(@Param('channelId') channelId: string, @Query() lastMessage: string) {
    return {};
  }

  @Get('/:channelId/member')
  public async getChannelMembers(@Param('channelId') channelId: string) {
    const result = await this.channelService.getChannelMembers(channelId);
    return { members: result };
  }

  @Post('/:channelId/member')
  public async inviteMemberToChannel(@Param() channelId: string, @Body() email: string) {
    const result = await this.channelService.inviteUserToChannel(email, channelId);
    return result;
  }
}
