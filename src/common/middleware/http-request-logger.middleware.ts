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
    res.on('finish', () => {
      const { ip, method, originalUrl } = req;
      const userAgent = req.get('user-agent');
      const userId = (req as any).user?.uid || undefined;

      this.logger.log(LogLevel.DEBUG, `${ip} USER-${userId} ${method} ${originalUrl} ${res.statusCode} ${userAgent}`);
    });

    next();
  }
}
