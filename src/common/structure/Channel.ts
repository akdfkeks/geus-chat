import { tags } from 'typia';

export interface IChannelIdParam {
  channelId: string & tags.Pattern<'^[0-9A-HJKMNP-TV-Z]{26}$'>;
}
