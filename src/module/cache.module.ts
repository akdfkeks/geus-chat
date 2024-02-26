import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const CacheModule = RedisModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => ({
    config: [
      {
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        namespace: 'message_channel_list',
        lazyConnect: true,
      },
      {
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
        namespace: 'socket_user_map',
        lazyConnect: true,
      },
    ],
  }),
});
