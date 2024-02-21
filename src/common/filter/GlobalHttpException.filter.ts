import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { TypeGuardError } from 'typia';
import { Request, Response } from 'express';
import { LogLevel, LoggerService } from 'src/module/winston.module';

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
        title: (exception.getResponse() as any).message || '',
        message: '',
      });
    } else {
      res.status(500).json({
        code: '999-999',
        title: 'Internal server error',
        message: null,
      });
    }
  }
}
