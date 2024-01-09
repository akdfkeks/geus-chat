import { RedisModule } from '@liaoliaots/nestjs-redis';
export const CacheModule = RedisModule.forRoot({
  config: [
    {
      host: 'localhost',
      port: 6379,
      namespace: 'message_channel_list',
      lazyConnect: true,
    },
    {
      host: 'localhost',
      port: 6379,
      namespace: 'socket_user_map',
      lazyConnect: true,
    },
  ],
});
