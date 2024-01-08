import { WinstonModule as Winston, utilities } from 'nest-winston';
import * as winston from 'winston';
import * as WinstonDaily from 'winston-daily-rotate-file';

const consoleOptions = {
  level: process.env.NODE_ENV === 'prod' ? 'http' : 'silly',
  format: winston.format.combine(
    winston.format.timestamp(),
    utilities.format.nestLike(process.env.NODE_ENV, { colors: true, prettyPrint: true }),
  ),
};

const dailyOptions = (logLevel: string): WinstonDaily.DailyRotateFileTransportOptions => {
  return {
    level: logLevel,
    datePattern: 'YYYY-MM-DD',
    dirname: `logs/${logLevel}`,
    filename: `%DATE%.${logLevel}.log`,
    maxFiles: 30,
  };
};

export const WinstonModule = Winston.forRoot({
  transports: [
    new winston.transports.Console(consoleOptions),
    new WinstonDaily(dailyOptions('error')),
    new WinstonDaily(dailyOptions('warn')),
    new WinstonDaily(dailyOptions('http')),
  ],
});
