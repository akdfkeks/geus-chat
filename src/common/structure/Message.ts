import { tags } from 'typia';

export namespace RecvPayload {
  export interface Text {
    channelId: string & tags.Pattern<'^[0-9A-HJKMNP-TV-Z]{26}$'>;
    message: string & tags.MinLength<1> & tags.MaxLength<2000>;
  }
  export interface Identify {
    accessToken: string;
  }
}

export namespace SendPayload {
  export interface Text {
    channelId: string;
    message: string;
    sender: {
      id: number;
    };
  }
  export interface UpdateChannel {
    channelId: string;
    [key: string]: any;
  }
}

export interface Message<PayloadType = any> {
  op: number & tags.Minimum<0> & tags.Maximum<100>;
  d: PayloadType;
}

export enum SendOP {
  DISPATCH_MESSAGE = 0,
  // DISPATCH_IMAGES = 1, using HTTP
  // DISPATCH_FILES = 2,  using HTTP
  UPDATE_CHANNEL = 3,
  HELLO = 10,
  ERROR = 11,
}

export enum RecvOP {
  SEND_MESSAGE = 0,
  SEND_IMAGES = 1,
  SEND_FILES = 2,
  IDENTIFY = 10,
  RECONNECT = 11,
}
