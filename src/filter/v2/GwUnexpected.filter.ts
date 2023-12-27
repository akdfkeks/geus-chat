import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { log } from 'console';
import { Socket } from 'socket.io';
import { GatewayException } from 'src/common/structure/Exception';
import { Message, SendOP } from 'src/common/structure/Message';

@Catch()
export class GwUnexpectExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // log(exception);
    const clientSocket = host.switchToWs().getClient<Socket>();
    clientSocket.send({
      op: SendOP.ERROR,
      d: {
        code: 5000,
        message: 'Internal server error',
      },
    });
  }
}
