export interface MessageSchema {
  _id: bigint;
  channel_id: string;
  message_type: number;
  data: any;
  user_id: number;
  user_name: string;
}
