import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { log } from 'console';
import { Socket } from 'socket.io';
import { GatewayException, INVALID_FORMAT } from 'src/structure/dto/Exception';
import { SendOP } from 'src/structure/dto/Message';
import { TypeGuardError } from 'typia';

@Catch(TypeGuardError)
export class GwBadRequestFilter extends BaseWsExceptionFilter {
  catch(exception: TypeGuardError, host: ArgumentsHost) {
    const clientSocket = host.switchToWs().getClient<Socket>();
    clientSocket.send({
      op: SendOP.ERROR,
      d: {
        code: INVALID_FORMAT.code,
        message: INVALID_FORMAT.message,
      },
    });
  }
}
