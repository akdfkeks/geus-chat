import { Body, Controller, Get, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ReqUser } from 'src/common/decorator/user';
import { UserGuard } from 'src/common/guard/jwt.guard';
import { JWTPayload } from 'src/structure/dto/Auth';
import { IChannelIdParam, IGetChannelMessageQuery } from 'src/structure/dto/Channel';
import { ChannelService } from 'src/service/channel.service';
import { BadRequestFilter } from 'src/common/filter/BadRequest.filter';
import { ChannelService } from 'src/service/channel.service';

@UseFilters(BadRequestFilter)
@UseGuards(UserGuard)
@Controller('/v2/channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('/')
  public onChannelListRequest(@ReqUser() user: JWTPayload) {
    return this.channelService.getJoinedChannels(user.uid);
  }

  @Post('/')
  public async onCreateChannelRequest(@ReqUser() user: JWTPayload, @Body() body: any) {
    const channelId = await this.channelService.createChannel(user, body);
    return { channelId };
  }

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

  @Get('/:channelId/message')
  public async onChannelMessageRequest(
    @ReqUser() user: JWTPayload,
    @Param() param: IChannelIdParam,
    @Query() query: IGetChannelMessageQuery,
  ) {
    return {
      channelId: param.channelId,
      messages: await this.channelService.getMessageHistory({ ...user, ...param, ...query }),
    };
  }
}
