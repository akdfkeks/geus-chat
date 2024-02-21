import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { MESSAGE_HISTORY } from 'src/common/constant/database';
import { RecvPayload, SendPayload } from 'src/structure/dto/Message';
import { MessageSchema } from 'src/structure/model/message';

@Injectable()
export class MessageHistoryRepository {
  constructor(@InjectConnection() private readonly mongo: Db) {}

  public async saveMessage(m: SendPayload.Content) {
    return await this.mongo.collection<MessageSchema>(MESSAGE_HISTORY).insertOne({
      _id: m.mid,
      channel_id: m.cid,
      message_type: m.ctype,
      data: m.data,
			time:m.time,
      user_id: m.uid,
      user_name: m.uname,
    });
  }

  public async getMessageHistory(
    m: {
      id: bigint;
      channelId: string;
    },
    count?: number,
  ) {
    return await this.mongo
      .collection<MessageSchema>(MESSAGE_HISTORY)
      .find({
        _id: m.id,
        channel_id: m.channelId,
      })
      .sort('_id')
      .toArray()
      .then((msgs) =>
        msgs.map((m) => {
          return {
            mid: m._id,
            cid: m.channel_id,
            ctype: m.message_type,
            data: m.data,
            time: m.time,
            uid: m.user_id,
            uname: m.user_name,
          } satisfies SendPayload.Content;
        }),
      );
  }
}
