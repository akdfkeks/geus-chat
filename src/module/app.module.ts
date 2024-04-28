import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EnvConfigModule } from 'src/module/env.module';
import { ChannelModule } from 'src/module/channel.module';
import { CacheModule } from './cache.module';
import { AuthModule } from './auth.module';
import { PrismaModule } from './prisma.module';
import { MongoModule } from './mongo.module';
import { WinstonModule } from 'src/module/winston.module';
import { GlobalHttpExceptionFilter } from 'src/common/filter/GlobalHttpException.filter';
import { APP_FILTER } from '@nestjs/core';
import { HttpRequestLogger } from 'src/common/middleware/http-request-logger.middleware';
import { AppController } from 'src/controller/app.controller';
import { AwsModule } from 'src/module/aws.module';

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
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
  ],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpRequestLogger).forRoutes('*');
  }
}
