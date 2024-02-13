import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ReqUser } from 'src/common/decorator/user';
import { UserGuard } from 'src/common/guard/jwt.guard';
import { JWTPayload } from 'src/structure/dto/Auth';
import { IChannelIdParam } from 'src/structure/dto/Channel';
import { ChannelService } from 'src/service/channel.service';
import { GlobalRequestFilter } from 'src/common/filter/GlobalRequest.filter';
import { BadRequestFilter } from 'src/common/filter/BadRequest.filter';

@UseFilters(GlobalRequestFilter, BadRequestFilter)
@UseGuards(UserGuard)
@Controller('/v2/channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('/')
  public onChannelListRequest(@ReqUser() user: JWTPayload) {
    return this.channelService.getJoinedChannels(user);
  }

  /**
   * Dev Only
   */
  @Post('/')
  public async onCreateChannelRequest(@ReqUser() user: JWTPayload, @Body() body: any) {
    const channelId = await this.channelService.createChannel(user, body);
    return { channelId };
  }

  /**
   * Dev Only
   */
  @Get('/:channelId/join')
  public async onChannelJoinRequest(@ReqUser() user: JWTPayload, @Param() param: any) {
    const result = await this.channelService.addMemberToChannel(user, param);
    return result;
  }

  @Get('/:channelId/member')
  public async onChannelMemberListRequest(@Param() param: any) {
    const result = await this.channelService.getChannelMembers(param);
    return { members: result };
  }

  // @Post('/:channelId/member')
  // public async onChannelMemberInviteRequest(@Param('channelId') channelId: string, @Body('userId') userId: number) {
  //   const result = await this.channelService.inviteUserToChannel(channelId, userId);
  //   return result;
  // }

  // @Delete('/:channelId/member')
  // public async onKickChannelMemberRequest(@Param() channelId: string, @Body('email') email: string) {
  //   return {};
  // }
}
