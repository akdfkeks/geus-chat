import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Socket } from 'socket.io';
import Redis from 'ioredis';
import { isFalsy, isNil } from 'src/common/util/utils';

@Injectable()
export class ConnectionService implements OnModuleInit, OnApplicationShutdown {
  constructor(
    @InjectRedis('message_channel_list')
    private readonly channels: Redis,
    @InjectRedis('socket_user_map')
    private readonly clients: Redis,
  ) {}

  async onModuleInit() {
    await Promise.all([this.channels.connect(), this.clients.connect()]);
  }

  async onApplicationShutdown() {
    try {
      await Promise.all([this.channels.reset(), this.clients.reset()]);
      this.channels.disconnect();
      this.clients.disconnect();
    } catch (e) {
      console.error(e);
    }
  }

  public async register(client: Socket): Promise<boolean> {
    if (isNil(client.data.user?.id)) return false;
    try {
      return (await this.clients.set(client.data.user.id, client.id)) === 'OK';
    } catch (e) {
      return false;
    }
  }

  public async deregister(client: Socket): Promise<boolean> {
    if (isNil(client.data.user?.id)) return false;
    try {
      return (await this.clients.del(client.data.user.id)) >= 1;
    } catch (e) {
      return false;
    }
  }

  public async cacheChannels(channel: string | string[]) {
    const channels = Array.isArray(channel) ? channel : [channel];
    const r = await this.channels.sadd('channels', channels);
    return r > 0;
  }

  public async isChannelCached(channelId: string) {
    return (await this.channels.sismember('channels', channelId)) === 1; // 1 is true
  }

  public async getClientId(userId: string) {
    return await this.clients.get(userId);
  }
}
