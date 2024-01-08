import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EnvConfigModule } from 'src/module/env.module';
import { ChannelModule } from 'src/module/channel.module';
import { CacheModule } from './cache.module';
import { AuthModule } from './auth.module';
import { PrismaModule } from './prisma.module';
import { MongoModule } from './mongo.module';
import { WinstonModule } from './winston.module';
import { LoggerContextMiddleware } from 'src/common/middleware/logger.middleware';

@Module({
  imports: [EnvConfigModule, ChannelModule, CacheModule, AuthModule, PrismaModule, MongoModule, WinstonModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerContextMiddleware).forRoutes('*');
  }
}
