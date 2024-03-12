export const DEFAULT_FIND_MESSAGE_LIMIT = 100;

export const SendOP = {
  DISPATCH_MESSAGE: 0,
  // DISPATCH_IMAGES: 1,
  // DISPATCH_FILES: 2,
  UPDATE_CHANNEL: 3,
  HELLO: 10,
  ERROR: 11,
} as const;

export const RecvOP = {
  SEND_MESSAGE: 0,
  IDENTIFY: 10,
  RECONNECT: 11,
} as const;

export const ContentType = {
  TEXT: 0,
  IMAGE: 1,
  FILE: 2,
} as const;
