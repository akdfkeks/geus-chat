import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TypeGuardError } from 'typia';
import { Request, Response } from 'express';

@Catch(TypeGuardError)
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: TypeGuardError, host: ArgumentsHost) {
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
