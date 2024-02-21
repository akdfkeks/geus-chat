import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, Inject } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class BadRequestFilter implements ExceptionFilter {
  constructor() {}

  public catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    // const req = ctx.getRequest<Request>();

    res.status(exception.getStatus()).json(exception.getResponse());
  }
}
