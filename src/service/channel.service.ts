import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Wrapper } from 'src/common/util/wrapper';
import { ChannelRepository } from 'src/repository/channel.repository';
import { MessageRepository } from 'src/repository/message.repository';
import { JWTPayload } from 'src/structure/dto/Auth';
import { IChannelIdParam, IGetChannelMessageQuery } from 'src/structure/dto/Channel';
import typia from 'typia';

@Injectable()
export class ChannelService {
  constructor(
    private readonly channelRepository: ChannelRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  public async getJoinedChannels(userId: string) {
    return { channels: await this.channelRepository.findJoinedChannelsByUserId(userId) };
  }

  public async getChannelMembers(param: IChannelIdParam) {
    Wrapper.TryOrThrow(
      () => typia.assertEquals<IChannelIdParam>(param),
      new BadRequestException({
        code: '123-123',
        title: '채널 참가자 조회에 실패했습니다.',
        message: '요청 형식이 올바르지 않습니다.',
      }),
    );
    return this.channelRepository.findChannelMembers(param.channelId);
  }

  public async getMessageHistory(dto: JWTPayload & IChannelIdParam & IGetChannelMessageQuery) {
    Wrapper.TryOrThrow(
      () => {
        typia.assertEquals<JWTPayload & IChannelIdParam & IGetChannelMessageQuery>(dto);
      },
      new BadRequestException({
        code: '123-123',
        title: '대화내역을 불러오지 못했습니다.',
        message: '요청 형식이 올바르지 않습니다.',
      }),
    );
    const isMemberOfChannel = (await this.channelRepository.findChannelMembers(dto.channelId))
      .map(({ id }) => id)
      .includes(dto.uid);

    if (!isMemberOfChannel) {
      throw new UnauthorizedException({
        code: '123-123',
        title: '대화내역을 불러오지 못했습니다.',
        message: '잘못된 요청입니다.',
      });
    }

    return this.messageRepository.getMessagesByQuery({
      channelId: dto.channelId,
      before: dto.before,
      limit: dto.limit,
    });
  }
}
