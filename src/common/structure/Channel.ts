import { tags } from 'typia';

export interface IChannelIdParam {
  channelId: string & tags.Pattern<'^[0-9A-HJKMNP-TV-Z]{26}$'>;
}

export interface ICreateChannelDto {
  channelName: string & tags.MinLength<1> & tags.MaxLength<30>;
}
