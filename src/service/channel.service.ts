import { Injectable } from '@nestjs/common';
import { MESSAGE_HISTORY_NO_PERMIT } from 'src/common/error/rest/expected';
import { ErrorUtil } from 'src/common/util/error.util';
import { FileUtil } from 'src/common/util/file.util';
import { ChannelRepository } from 'src/repository/channel.repository';
import { MessageRepository } from 'src/repository/message.repository';
import { AwsService } from 'src/service/aws.service';
import { ChannelGWService } from 'src/service/channel-gw.service';

@Injectable()
export class ChannelService {
  constructor(
    private readonly channelGateway: ChannelGWService,
    private readonly awsService: AwsService,
    private readonly channelRepository: ChannelRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  public async getJoinedChannels(userId: bigint) {
    return { channels: await this.channelRepository.findJoinedChannelsByUserId(userId) };
  }

  public async getChannelMembers(channelId: bigint) {
    return this.channelRepository.findChannelMembers(channelId);
  }

  public async getMessageHistory(dto: { userId: bigint; channelId: bigint; before: bigint; limit: number }) {
    if (!this.isMemberOfChannel(dto.userId, dto.channelId)) {
      throw ErrorUtil.unauthorized(MESSAGE_HISTORY_NO_PERMIT);
    }

    return this.messageRepository.getMessagesByQuery({
      channelId: dto.channelId,
      before: dto.before,
      limit: dto.limit,
    });
  }

  public async sendMediaMessage(dto: { userId: bigint; channelId: bigint; files: Array<Express.Multer.File> }) {
    const files = (await this.awsService.uploadImageToS3(FileUtil.toUploadable(dto.files, { prefix: 'images/' })))
      .filter((value) => value.result !== null)
      .map((v) => {
        return { origin: v.result!.origin, resized: v.result!.resized };
      });

    await this.channelGateway.broadcastMedia({
      cid: dto.channelId,
      uid: dto.userId,
      files,
    });

    return { message: `${files.length} files are uploaded.` };
  }

  private async isMemberOfChannel(userId: bigint, channelId: bigint) {
    return (await this.channelRepository.findChannelMembers(channelId)).map(({ id }) => id).includes(userId);
  }
}
