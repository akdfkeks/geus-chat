import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ReqUser } from 'src/common/decorator/user';
import { UserGuard } from 'src/common/guard/jwt.guard';
import { JWTPayload } from 'src/common/structure/Auth';
import { ChannelService } from 'src/injectable/service/channel.service';

@UseFilters()
@UseGuards(UserGuard)
@Controller('/v2/channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('/')
  public onChannelListRequest(@ReqUser() user: JWTPayload) {
    return this.channelService.getJoinedChannels(user);
  }

  /**
   * Test Only
   */
  @Post('/')
  public async onCreateChannelRequest(@ReqUser() user: JWTPayload, @Body() body: any) {
    const channelId = await this.channelService.createChannel(user, body);
    return { channelId };
  }

  @Get('/:channelId/member')
  public async onChannelMemberListRequest(@Param('channelId') channelId: string) {
    const result = await this.channelService.getChannelMembers(channelId);
    return { members: result };
  }

  @Post('/:channelId/member')
  public async onChannelMemberInviteRequest(@Param() channelId: string, @Body('email') email: string) {
    const result = await this.channelService.inviteUserToChannel(email, channelId);
    return result;
  }

  @Delete('/:channelId/member')
  public async onKickChannelMemberRequest(@Param() channelId: string, @Body('email') email: string) {
    return {};
  }
}
