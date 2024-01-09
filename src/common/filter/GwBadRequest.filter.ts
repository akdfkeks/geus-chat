import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { log } from 'console';
import { Socket } from 'socket.io';
import { GwExceptionFilter } from 'src/common/filter/GwException.filter';
import { GatewayException, INVALID_FORMAT } from 'src/structure/dto/Exception';
import { SendOP } from 'src/structure/dto/Message';
import { TypeGuardError } from 'typia';

@Catch(TypeGuardError)
export class GwBadRequestFilter extends GwExceptionFilter {
  catch(exception: TypeGuardError, host: ArgumentsHost) {
    super.catch(new GatewayException(INVALID_FORMAT), host);
  }
}
