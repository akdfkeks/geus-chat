import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { MESSAGE_HISTORY } from 'src/common/constant/database';
import { RecvPayload, SendPayload } from 'src/structure/dto/Message';
import { MessageSchema } from 'src/structure/model/message';

@Injectable()
export class MessageHistoryRepository {
  constructor(@InjectConnection() private readonly mongo: Db) {}

  public async saveMessage(m: SendPayload.Text) {
    return await this.mongo.collection<MessageSchema>(MESSAGE_HISTORY).insertOne({
      _id: m.mid,
      channel_id: m.cid,
      data: m.data,
      message_type: m.mtype,
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
            mtype: m.message_type,
            uid: m.user_id,
            uname: m.user_name,
            data: m.data,
          } satisfies SendPayload.Text;
        }),
      );
  }
}
