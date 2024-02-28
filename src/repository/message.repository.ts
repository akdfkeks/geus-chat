import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { MESSAGE_HISTORY } from 'src/common/constant/database';
import { IGetChannelMessageQuery } from 'src/structure/dto/Channel';
import { RecvPayload, SendPayload } from 'src/structure/dto/Message';
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

  public async getMessagesByQuery(channelId: string, query: IGetChannelMessageQuery) {
    if (!query.after && !query.before) return [];

    return this.mongo
      .collection<MessageSchema>(MESSAGE_HISTORY)
      .find(
        {
          _id:
            query.after && query.before
              ? {
                  $gte: BigInt(query.after),
                  $lte: BigInt(query.before),
                }
              : query.before
                ? { $lte: BigInt(query.before) }
                : { $gte: BigInt(query.after!) },
          channel_id: channelId,
        },
        {
          limit: query.after && query.before ? undefined : query.limit ? Number(query.limit) : undefined,
        },
      )
      .sort('_id')
      .toArray()
      .then((msgs) =>
        msgs.map(
          (m) =>
            ({
              mid: m._id.toString(10),
              cid: m.channel_id,
              ctype: m.message_type,
              data: m.data,
              time: m.time,
              uid: m.user_id,
              uname: m.user_name,
            }) satisfies any,
        ),
      );
  }
}
