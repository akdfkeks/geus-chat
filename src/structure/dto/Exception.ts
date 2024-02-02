import { WsException } from '@nestjs/websockets';
import { log } from 'console';

export namespace GatewayException {
  export interface Args {
    code: number;
    message: string;
    disconnect: boolean;
  }
}

export class GatewayException extends WsException {
  public code: number;
  public disconnect: boolean;

  constructor(args: GatewayException.Args) {
    super(args.message);
    this.message = args.message;
    this.code = args.code;
    this.disconnect = args.disconnect;
  }

  public print() {
    console.error(`[Error] ${this.message}\ncode: ${this.code}\ndisconnect: ${this.disconnect}`);
  }
}

// ------------------------GatewayExecption constructor args-----------------------------

export const INVALID_FORMAT: GatewayException.Args = {
  code: 4000,
  message: 'Invalid request format',
  disconnect: false,
};

export const CLIENT_NOT_IDENTIFIED: GatewayException.Args = {
  code: 4010,
  message: 'Client not identified',
  disconnect: false,
};

export const INVALID_TOKEN: GatewayException.Args = {
  code: 4011,
  message: 'Error while verifying access token',
  disconnect: true,
};

export const EXPIRED_ACCESS_TOKEN: GatewayException.Args = {
  code: 4012,
  message: 'Access token expired',
  disconnect: false,
};

export const UNACTIVATED_TOKEN: GatewayException.Args = {
  code: 4013,
  message: 'Access token not activated',
  disconnect: false,
};

export const UNKNOWN_AUTH_ERROR: GatewayException.Args = {
  code: 4014,
  message: 'Unknown authentication error',
  disconnect: false,
};

export const NO_PERMISSION: GatewayException.Args = {
  code: 4030,
  message: 'No permission',
  disconnect: false,
};

export const CHANNEL_NOT_FOUND: GatewayException.Args = {
  code: 4041,
  message: 'Channel not found',
  disconnect: false,
};
