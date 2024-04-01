import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { TypeGuardError } from 'typia';
import { Request, Response } from 'express';
import { LogLevel, LoggerService } from 'src/module/winston.module';
import { INTERNAL_SERVER_ERROR } from 'src/common/error/http-error';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    this.logger.log(LogLevel.ERROR, 'Unhandled exception', {
      data: {
        headers: req.headers,
        body: req.body,
        stack: exception.stack || '',
      },
    });
    if (exception instanceof HttpException) {
      res.status(exception.getStatus()).json({
        code: '123-123',
        title: (exception.getResponse() as any).title || '',
        message: (exception.getResponse() as any).message || '',
      });
    } else {
      res.status(500).json(INTERNAL_SERVER_ERROR);
    }
  }
}
