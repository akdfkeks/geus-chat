import { WsException as BaseWsException } from '@nestjs/websockets';
import { WsErrorCause } from 'src/structure/error/error-cause';

export class WsException extends BaseWsException {
  public code: string;
  public disconnect: boolean;

  constructor(args: WsErrorCause) {
    super(args.message);
    this.message = args.message;
    this.code = args.code;
    this.disconnect = args.disconnect;
  }
}
