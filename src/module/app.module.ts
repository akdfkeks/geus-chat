import { Module } from '@nestjs/common';
import { EnvConfigModule } from 'src/module/env.module';
import { ChannelModule } from 'src/module/channel.module';
import { CacheModule } from './cache.module';
import { AuthModule } from './auth.module';
import { PrismaModule } from './prisma.module';
import { MongoModule } from './mongo.module';

@Module({
  imports: [EnvConfigModule, ChannelModule, CacheModule, AuthModule, PrismaModule, MongoModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
