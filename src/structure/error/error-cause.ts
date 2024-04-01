export interface ErrorCause {
  code: string;
  title: string;
  message: string;
}

export interface WsErrorCause extends ErrorCause {
  disconnect: boolean;
}
