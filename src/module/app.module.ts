import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EnvConfigModule } from 'src/module/env.module';
import { ChannelModule } from 'src/module/channel.module';
import { CacheModule } from './cache.module';
import { AuthModule } from './auth.module';
import { PrismaModule } from './prisma.module';
import { MongoModule } from './mongo.module';
import { WinstonModule } from 'src/module/winston.module';
import { GlobalExceptionFilter } from 'src/common/filter/rest/Global.filter';
import { APP_FILTER } from '@nestjs/core';
import { HttpRequestLogger } from 'src/common/middleware/http-request-logger.middleware';
import { AwsModule } from 'src/module/aws.module';
import { ExpectedExceptionFilter } from 'src/common/filter/rest/Expected.filter';
import { HttpExceptionFilter } from 'src/common/filter/rest/Http.filter';

@Module({
  imports: [
    EnvConfigModule,
    ChannelModule,
    CacheModule,
    AuthModule,
    PrismaModule,
    MongoModule,
    WinstonModule,
    AwsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER, // 3rd
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER, // 2nd
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER, // 1st
      useClass: ExpectedExceptionFilter,
    },
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpRequestLogger).forRoutes('*');
  }
}
