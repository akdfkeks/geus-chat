import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { log } from 'console';
import { GatewayException, INVALID_FORMAT } from 'src/structure/dto/Exception';
import { TypeGuardError } from 'typia';

@Catch(TypeGuardError)
export class GwBadRequestFilter extends BaseWsExceptionFilter {
  catch(exception: TypeGuardError, host: ArgumentsHost) {
    log(exception);
    throw new GatewayException(INVALID_FORMAT);
  }
}
