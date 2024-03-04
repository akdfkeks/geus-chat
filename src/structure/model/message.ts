export interface MessageSchema {
  _id: bigint;
  channel_id: string;
  message_type: number;
  data: any;
  time: string;
  user_id: string;
  user_name: string;
}
