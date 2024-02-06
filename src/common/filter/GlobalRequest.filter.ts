import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TypeGuardError } from 'typia';
import { Request, Response } from 'express';

@Catch()
export class GlobalRequestFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(500).json({
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
