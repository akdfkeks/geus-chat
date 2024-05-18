import * as winston from 'winston';
import * as WinstonDaily from 'winston-daily-rotate-file';
import { WinstonModule as WM, utilities as winstonUtils } from 'nest-winston';

const { combine, timestamp, ms } = winston.format;

const dailyOptions = (logLevel: string) => {
  return {
    level: logLevel,
    datePattern: 'YYYY-MM-DD',
    format: combine(
      timestamp(),
      ms(),
      winstonUtils.format.nestLike('GEUS', {
        colors: false,
        prettyPrint: false,
      }),
    ),
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

export const WinstonModule = WM.forRoot({
  transports: [
    new WinstonDaily(dailyOptions('error')),
    new WinstonDaily(dailyOptions('warn')),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winstonUtils.format.nestLike('GEUS', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
  ],
});
