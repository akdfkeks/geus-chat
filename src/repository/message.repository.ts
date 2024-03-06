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

  public async saveMessage(m: SendPayload.Content) {
    return await this.mongo.collection<MessageSchema>(MESSAGE_HISTORY).insertOne({
      _id: m.mid,
      channel_id: m.cid,
      message_type: m.ctype,
      data: m.data,
      time: m.time,
      user_id: m.uid,
      user_name: m.uname,
    });
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
      .then((msgs) =>
        msgs.map((m) => {
          return {
            mid: m._id.toString(10),
            cid: m.channel_id,
            ctype: m.message_type,
            data: m.data,
            time: m.time,
            uid: m.user_id,
            uname: m.user_name,
          } satisfies IFindMessageResult;
        }),
      );
  }
}
