import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TypeGuardError } from 'typia';
import { Request, Response } from 'express';

@Catch(TypeGuardError, TypeError)
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(400).json({
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
