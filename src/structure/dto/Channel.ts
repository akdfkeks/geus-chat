import { UserProfile } from 'src/structure/dto/User';
import { tags } from 'typia';

export interface IChannelIdParam {
  channelId: string & tags.Pattern<'^[0-9]+$'>;
}

export interface ICreateChannelDto {
  channelName: string & tags.MinLength<1> & tags.MaxLength<30>;
}

export interface IGetChannelMessageQuery {
  before?: string & tags.Pattern<'^[0-9]+$'>;
  limit?: string & tags.Pattern<'^[0-9]+$'>;
}

export interface IFindChannelResult {
  id: string;
  name: string;
  icon_url: string;
  owner_id: string;
}

export type IFindChannelMemberResult = UserProfile & { role: number };

export interface ICreateMemberInChannelResult {
  userId: string;
  channelId: string;
}
