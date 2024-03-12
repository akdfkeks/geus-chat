import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { MESSAGE_HISTORY } from 'src/common/constant/database';
import { DEFAULT_FIND_MESSAGE_LIMIT } from 'src/common/constant/message';
import { SnowFlake } from 'src/common/util/snowflake';
import { IGetChannelMessageQuery } from 'src/structure/dto/Channel';
import { Message } from 'src/structure/message';

@Injectable()
export class MessageRepository {
  constructor(@InjectConnection() private readonly mongo: Db) {}

  public async saveMessage(m: Message.RecvDto & { uid: string }) {
    const msg = Message.toModel(m);
    return this.mongo
      .collection<Message.Model>(MESSAGE_HISTORY)
      .insertOne(msg)
      .then((v) => Message.toSendDto(msg));
  }

  public async getMessagesByQuery(query: { channelId: bigint; before: bigint; limit: number }) {
    return this.mongo
      .collection<Message.Model>(MESSAGE_HISTORY)
      .find({
        _id: { $lte: query.before },
        // time: { $gte: 채팅방에 입장한 시간 },
        channel_id: query.channelId,
      })
      .sort('_id', -1)
      .limit(query.limit)
      .toArray()
      .then((msgs) => msgs.map(Message.toSendDto));
  }
}
