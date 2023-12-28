import { Injectable, OnModuleInit, OnModuleDestroy, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GatewayException } from 'src/common/structure/Exception';
import * as error from 'src/common/structure/Exception';
import { RecvOP, SendOP } from 'src/common/structure/Message';
import { Payload, Message } from 'src/common/structure/Message';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import typia from 'typia';
import { ChannelRepository } from 'src/injectable/repository/channel.repository';
import { ConnectionService } from './connection.service';
import { PrismaService } from './prisma.service';
import { ChannelMemberRepository } from 'src/injectable/repository/channel-member.repository';
import { JWTPayload } from 'src/common/structure/Auth';

@Injectable()
export class ChannelService implements OnModuleInit, OnModuleDestroy {
  public server: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly channelRepository: ChannelRepository,
    private readonly connectionService: ConnectionService,
    private readonly memberRepository: ChannelMemberRepository,
  ) {}

  public async onModuleInit() {}
  public async onModuleDestroy() {}

  /**
   * opcode에 맞는 handler를 호출합니다
   * @param server
   * @param client
   * @param message
   * @returns
   */
  public async handleMessage(server: Server, client: Socket, message: Message) {
    switch (message.op) {
      case RecvOP.SEND_MESSAGE: {
        return await this.sendMessage(server, client, message);
      }
      case RecvOP.IDENTIFY: {
        return await this.identifyClient(client, message);
      }
      default:
        console.log(message);
        return;
    }
  }

  /**
   * @description [WS Only] 유저가 전송한 메세지를 특정 채널에 전송합니다.
   * @param {object} server socket.io Server 객체
   * @param {object} client socket.io Socket 객체
   * @param {object} message 유저가 전송한 메세지 객체
   * @throws {GatewayException, TypeGuardError}
   */
  public async sendMessage(server: Server, client: Socket, message: Message) {
    this.isClientIdentified(client);

    typia.assertEquals<Message<Payload.Text>>(message);

    const msg: Message = {
      op: SendOP.DISPATCH_MESSAGE,
      d: { ...message.d, sender: client.data.user },
    };

    return await this.dispatch(server, client, msg);
  }

  public async identifyClient(client: Socket, message: Message) {
    typia.assertEquals<Message<Payload.Identify>>(message);

    const { id: userId } = this.authService.verifyAccessToken(message.d.accessToken);
    await this.initializeClient(client, userId);
    const msg: Message = {
      op: SendOP.HELLO,
      d: {
        userId,
        channels: [...client.rooms].slice(1), // Client ID 제외
      },
    };
    client.send(msg);
  }

  private async initializeClient(client: Socket, userId: number) {
    const { nickname, socialType } = await this.userService.getUserNickAndTypeByUserId(userId);
    const ids = await this.channelRepository.getJoinedChannelsIdByUserId(userId);
    this.initClientIdentifier(client, { userId, nickname, socialType });

    await client.join(ids);

    return;
  }

  private async dispatch(server: Server, client: Socket, message: Message) {
    // await this.checkChannelExists(message.d.channelId); 채널이 존재하는지 꼭 확인해야할까?
    await this.checkMessagePermission(client, message);

    server.to(message.d.channelId).emit('message', message);

    return await this.saveMessage(message);
  }

  /**
   * @description 채널 소속 멤버를 조회합니다.
   * @param {string} channelId 조회할 채널의 ID
   * @returns {Array<User>} 멤버 목록
   */
  public async getChannelMembers(channelId: string) {
    return this.memberRepository.findChannelMembers(channelId);
  }

  public async inviteUserToChannel(channelId: string, userId: number) {
    await this.checkChannelExists(channelId);

    const clientId = await this.connectionService.getClientId(userId);
    // if client is online
    if (clientId) {
      const client = (await this.server.in(clientId).fetchSockets())[0];
      client.join(channelId);
    }
  }

  private async checkMessagePermission(client: Socket, message: Message) {
    if (!client.rooms.has(message.d.channelId)) {
      throw new GatewayException(error.NO_PERMISSION);
    }
  }

  private async saveMessage(message: Message) {
    // 바로 저장 vs MQ 에 넘기기
  }

  private initClientIdentifier(client: Socket, payload: any) {
    client.data.user = {
      id: payload.id,
      nickname: payload.nickname,
      socialType: payload.socialType,
    };
  }

  private isClientIdentified(client: Socket) {
    if (!client.data.user) throw new GatewayException(error.CLIENT_NOT_IDENTIFIED);
  }

  public async checkChannelExists(channelId: string) {
    if (await this.connectionService.isChannelCached(channelId)) return;

    const channel = await this.channelRepository.getChannelById(channelId);
    if (!channel) throw new GatewayException(error.CHANNEL_NOT_FOUND);

    await this.connectionService.cacheChannels(channelId);
  }

  public async createChannel(user: JWTPayload, dto: any) {
    const channel = await this.channelRepository.createChannel(user.id, dto.channelName);
    return channel.id;
  }

  public async getJoinedChannels(user: JWTPayload) {
    return this.channelRepository.getJoinedChannelListByUserId(user.id);
  }
}
