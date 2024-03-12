import {
  Controller,
  DefaultValuePipe as DefaultValue,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ReqUser } from 'src/common/decorator/user';
import { UserGuard } from 'src/common/guard/jwt.guard';
import { BadRequestFilter } from 'src/common/filter/BadRequest.filter';
import { ChannelService } from 'src/service/channel.service';
import { SnowFlake } from 'src/common/util/snowflake';
import { ParseBigIntPipe } from 'src/common/pipe/parse-bigint.pipe';
import { DEFAULT_FIND_MESSAGE_LIMIT as FIND_MESSAGE_LIMIT } from 'src/common/constant/message';

@UseFilters(BadRequestFilter)
@UseGuards(UserGuard)
@Controller('/v2/channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('/')
  public onChannelListRequest(@ReqUser() userId: bigint) {
    return this.channelService.getJoinedChannels(userId);
  }

  // @Post('/')
  // public async onCreateChannelRequest(@ReqUser() user: JWTPayload, @Body() body: any) {
  //   const channelId = await this.channelService.createChannel(user, body);
  //   return { channelId };
  // }

  // @Get('/:channelId/join')
  // public async onChannelJoinRequest(@ReqUser() user: JWTPayload, @Param() param: any) {
  //   const result = await this.channelService.addMemberToChannel(user, param);
  //   return result;
  // }

  @Get('/:channelId/member')
  public async onChannelMemberListRequest(@Param('channelId', ParseBigIntPipe) channelId: bigint) {
    const result = await this.channelService.getChannelMembers(channelId);
    return { members: result };
  }

  @Get('/:channelId/message')
  public async onChannelMessageRequest(
    @ReqUser() userId: bigint,
    @Param('channelId', ParseBigIntPipe) channelId: bigint,
    @Query('before', new DefaultValue(SnowFlake.genFake()), ParseBigIntPipe) before: bigint,
    @Query('limit', new DefaultValue(FIND_MESSAGE_LIMIT), ParseIntPipe) limit: number,
  ) {
    return {
      channelId: channelId.toString(),
      messages: await this.channelService.getMessageHistory({ userId, channelId, before, limit }),
    };
  }
}
