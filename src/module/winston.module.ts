import { Global, Injectable, Module } from '@nestjs/common';
import * as winston from 'winston';
import * as WinstonDaily from 'winston-daily-rotate-file';

const { combine, timestamp, prettyPrint, json, metadata, colorize } = winston.format;

const consoleOptions = () => {
  return {
    level: 'debug',
    format: combine(json(), metadata(), timestamp(), prettyPrint()),
  } satisfies winston.transports.ConsoleTransportOptions;
};

const dailyOptions = (logLevel: string) => {
  return {
    level: logLevel,
    datePattern: 'YYYY-MM-DD',
    format: combine(json(), metadata(), timestamp()),
    utc: true,
    dirname: `logs/${logLevel}`,
    filename: `%DATE%.${logLevel}.log`,
    maxFiles: 30,
  } satisfies WinstonDaily.DailyRotateFileTransportOptions;
};

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

@Injectable()
export class LoggerService {
  private winston: winston.Logger;

  constructor() {
    this.winston = winston.createLogger({
      levels: winston.config.npm.levels,
      transports: [
        new WinstonDaily(dailyOptions('error')),
        new WinstonDaily(dailyOptions('warn')),
        new WinstonDaily(dailyOptions('info')),
      ],
    });

    if (process.env.NODE_ENV !== 'prod') {
      this.winston.add(new WinstonDaily(dailyOptions('debug')));
      this.winston.add(new winston.transports.Console(consoleOptions()));
    }
  }

  public log(level: LogLevel, message: string, meta?: any) {
    this.winston.log(level, message, meta);
  }
}

@Global()
@Module({
  imports: [],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class WinstonModule {}
