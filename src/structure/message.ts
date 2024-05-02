import { Long } from 'mongodb';
import { SnowFlake } from 'src/common/util/snowflake';
import { tags } from 'typia';

export namespace Message {
  export interface Model {
    _id: Long;
    channel_id: Long;
    data: string;
    files: Array<FileDto>;
    time: Date;
    author_id: Long;
  }

  export interface RecvDto {
    cid: string & tags.Pattern<'^[0-9]+$'>;
    data: string & tags.MinLength<1> & tags.MaxLength<2000>;
  }

  export interface FileDto {
    origin: string;
    resized: string;
  }
  export interface SendDto {
    mid: string; // Message ID
    cid: string; // Channel ID
    data: string;
    files: Array<FileDto>;
    time: string; // ISO 8601
    uid: string;
  }

  export const toModel = (dto: Message.RecvDto & { uid: string; files?: Array<FileDto> }): Message.Model => {
    return {
      // _id: new Long(SnowFlake.generate(), true),
      _id: Long.fromBigInt(SnowFlake.generate(), true),
      channel_id: Long.fromString(dto.cid, true, 10),
      data: dto.data,
      files: dto.files ?? [],
      time: new Date(),
      author_id: Long.fromString(dto.uid, true, 10),
    };
  };

  export const toSendDto = (model: Message.Model): Message.SendDto => {
    return {
      mid: model._id.toString(),
      cid: model.channel_id.toString(),
      data: model.data,
      files: model.files,
      time: model.time.toISOString(),
      uid: model.author_id.toString(),
    };
  };
}
