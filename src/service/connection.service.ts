import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Socket } from 'socket.io';
import Redis from 'ioredis';

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

  public async cacheChannels(channel: string | string[]) {
    const channels = Array.isArray(channel) ? channel : [channel];
    const r = await this.channels.sadd('channels', channels);
    return r > 0;
  }

  public async isChannelCached(channelId: string) {
    return (await this.channels.sismember('channels', channelId)) === 1; // 1 is true
  }

  public async register(newClient: Socket, userId: number) {
    const oldClientId = await this.channels.get(userId.toString());
    if (oldClientId !== newClient.id) await this.clients.set(userId.toString(), newClient.id);
    return oldClientId;
  }

  public async deregister(client: Socket) {
    if (!client.data.uid) return;
    const rst = await this.clients.del(client.data.uid.toString());
    return rst >= 1;
  }

  public async getClientId(userId: number) {
    return await this.clients.get(userId.toString());
  }
}
