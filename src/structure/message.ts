import { Long } from 'mongodb';
import { SnowFlake } from 'src/common/util/snowflake';
import { tags } from 'typia';

export namespace Message {
  export interface Model {
    _id: Long;
    channel_id: Long;
    content_type: number;
    data: string;
    time: Date;
    author_id: Long;
  }

  export interface RecvDto {
    cid: string & tags.Pattern<'^[0-9]+$'>;
    data: string & tags.MinLength<1> & tags.MaxLength<2000>;
  }

  export interface SendDto {
    mid: bigint; // Message ID
    cid: bigint; // Channel ID
    ctype: number; // Message Type {0: Text, 1: Image, 2: File, ...}
    data: string;
    time: string; // ISO 8601
    uid: bigint;
  }

  export const toModel = (dto: Message.RecvDto & { uid: string }): Message.Model => {
    return {
      // _id: new Long(SnowFlake.generate(), true),
      _id: Long.fromBigInt(SnowFlake.generate(), true),
      channel_id: Long.fromString(dto.cid, true, 10),
      content_type: 0, // temp.
      data: dto.data,
      time: new Date(),
      author_id: Long.fromString(dto.uid, true, 10),
    };
  };

  export const toSendDto = (model: Message.Model): Message.SendDto => {
    return {
      mid: model._id.toBigInt(),
      cid: model.channel_id.toBigInt(),
      ctype: model.content_type,
      data: model.data,
      time: model.time.toISOString(),
      uid: model.author_id.toBigInt(),
    };
  };
}
