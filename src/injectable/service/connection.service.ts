import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';
import { ERROR } from 'src/common/error/error';

@Injectable()
export class ConnectionService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectRedis('message_channel_list')
    private readonly channels: Redis,
    @InjectRedis('socket_user_map')
    private readonly clients: Redis,
  ) {}

  async onModuleInit() {}

  async onModuleDestroy() {
    await this.channels.reset();
    await this.clients.reset();
  }

  public async cacheChannels(channel: string | string[]) {
    const channels = Array.isArray(channel) ? channel : [channel];
    const r = await this.channels.sadd('channels', channels);
    return r > 0;
  }

  public async isChannelCached(channelId: string) {
    return (await this.channels.sismember('channels', channelId)) === 1; // 1 is true
  }

  public async registerClient(userId: number, socketId: string) {
    const rst = await this.clients.set(userId.toString(), socketId);
    return rst === 'OK';
  }

  public async deregisterClient(userId: number) {
    const rst = await this.clients.del(userId.toString());
    return rst >= 1;
  }

  public async getClientId(userId: number) {
    return await this.clients.get(userId.toString());
  }
}
