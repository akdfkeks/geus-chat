import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Request, Response } from 'express';
import { ExpectedError } from 'src/structure/error';
import { LogLevel } from 'src/module/winston.module';
import { Logger } from 'winston';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  catch(exception: ExpectedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    this.logger.log(LogLevel.WARN, `${exception.status} ${exception.name.split('Exception')[0]}`, {
      path: req.originalUrl,
      params: req.params,
      headers: req.headers,
      body: req.body,
    });

    res.status(exception.status).json({
      code: '000-0000',
      title: exception.name,
      message: exception.message,
    });
  }
}
