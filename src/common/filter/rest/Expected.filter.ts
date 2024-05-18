import { ArgumentsHost, Catch, ExceptionFilter, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Request, Response } from 'express';
import { ExpectedError } from 'src/structure/error';
import { LogLevel } from 'src/module/winston.module';
import { Logger } from 'winston';

@Catch(ExpectedError)
export class ExpectedExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  catch(exception: ExpectedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    this.logger.log(LogLevel.WARN, `${exception.status} ${exception.name}`, {
      path: req.originalUrl,
      params: req.params,
      headers: req.headers,
      body: req.body,
    });

    res.status(exception.status).json(exception.getResponse());
  }
}
