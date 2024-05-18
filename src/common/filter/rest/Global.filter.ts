import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LogLevel } from 'src/module/winston.module';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    this.logger.log(LogLevel.ERROR, '500: InternalServerError', {
      path: req.originalUrl,
      params: req.params,
      headers: req.headers,
      body: req.body,
      stack: exception instanceof Error ? exception.stack ?? '' : '',
    });

    res.status(500).json({
      code: '000-0000',
      title: 'InternalServerError',
      message: '알 수 없는 오류가 발생하여 요청을 처리하지 못했습니다.',
    });
  }
}
