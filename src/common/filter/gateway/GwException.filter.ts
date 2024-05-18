import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SendOP } from 'src/common/constant/message';

@Catch()
export class GwExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const clientSocket = host.switchToWs().getClient<Socket>();
    clientSocket.emit('event', {
      op: SendOP.ERROR,
      d: {
        code: exception.code || 5000,
        message: exception.message || 'Internal server error.',
      },
    });

    if (exception.disconnect) clientSocket.disconnect();
  }
}
