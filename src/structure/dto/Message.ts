import { tags } from 'typia';

export enum SendOP {
  DISPATCH_MESSAGE = 0,
  DISPATCH_IMAGES = 1,
  DISPATCH_FILES = 2,
  UPDATE_CHANNEL = 3,
  HELLO = 10,
  ERROR = 11,
}

export enum RecvOP {
  SEND_MESSAGE = 0,
  IDENTIFY = 10,
  RECONNECT = 11,
}

export enum ContentType {
  TEXT = 0,
  FILE = 1,
}

export namespace RecvPayload {
  export interface Text {
    cid: string & tags.Pattern<'^[0-9]+$'>;
    data: string & tags.MinLength<1> & tags.MaxLength<2000>;
  }
  export interface Identify {
    token: string;
  }
}

export namespace SendPayload {
  export interface Content {
    mid: bigint; // Message ID
    cid: string; // Channel ID
    ctype: ContentType; // Message Type {0: Text, 1: Image, 2: File, ...}
    data: string;
    time: string; // ISO 8601
    uid: string; // User ID
    uname: string; // User Name
  }

  export interface UpdateChannel {
    cid: string;
    [key: string]: any;
  }
}

export interface Message<PayloadType = any> {
  op: number & tags.Minimum<0> & tags.Maximum<100>;
  d: PayloadType;
}

export interface IFindMessageResult {
  mid: string;
  cid: string;
  ctype: number;
  data: string;
  time: string;
  uid: string;
  uname: string;
}
