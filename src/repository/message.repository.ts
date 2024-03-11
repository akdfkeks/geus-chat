import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { MESSAGE_HISTORY } from 'src/common/constant/database';
import { DEFULT_FIND_MESSAGE_LIMIT } from 'src/common/constant/message';
import { SnowFlake } from 'src/common/util/snowflake';
import { IGetChannelMessageQuery } from 'src/structure/dto/Channel';
import { IFindMessageResult, RecvPayload, SendPayload } from 'src/structure/dto/Message';
import { MessageSchema } from 'src/structure/model/message';

@Injectable()
export class MessageRepository {
  constructor(@InjectConnection() private readonly mongo: Db) {}

      .then((v) => Message.toSendDto(msg));
  }

  public async getMessagesByQuery(query: IGetChannelMessageQuery & { channelId: string }) {
    return this.mongo
      .collection<MessageSchema>(MESSAGE_HISTORY)
      .find({
        _id: {
          // $gte: {{ 사용자가 채팅방에 입장한 시간 }}
          $lte: query.before ? BigInt(query.before) : SnowFlake.genFake(),
        },
        channel_id: query.channelId,
      })
      .sort('_id', -1)
      .limit(query.before ? Math.min(+query.before, DEFULT_FIND_MESSAGE_LIMIT) : DEFULT_FIND_MESSAGE_LIMIT)
      .toArray()
      .then((msgs) => msgs.map(Message.toSendDto));
  }
}
