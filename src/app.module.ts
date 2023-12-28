import { Module } from '@nestjs/common';
import { EnvConfigModule } from 'src/module/env.module';
import { ChannelModule } from 'src/module/channel.module';
import { CacheModule } from './module/cache.module';
import { AuthModule } from './module/auth.module';
import { PrismaModule } from './module/prisma.module';

@Module({
  imports: [EnvConfigModule, ChannelModule, CacheModule, AuthModule, PrismaModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
