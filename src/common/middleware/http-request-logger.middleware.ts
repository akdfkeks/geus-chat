import { Inject, Injectable, NestMiddleware, forwardRef } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LogLevel, LoggerService } from 'src/module/winston.module';

@Injectable()
export class HttpRequestLogger implements NestMiddleware {
  constructor(
    @Inject(forwardRef(() => LoggerService))
    private readonly logger: LoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
		if (process.env.NODE_ENV === 'prod') return;
    res.on('finish', () => {
      this.logger.log(LogLevel.DEBUG, 'request logging', { headers: req.headers });
    });

    next();
  }
}
