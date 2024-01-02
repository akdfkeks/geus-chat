import { Injectable, OnModuleInit, OnModuleDestroy, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GatewayException } from 'src/common/structure/Exception';
import * as error from 'src/common/structure/Exception';
import { RecvOP, SendOP, SendPayload } from 'src/common/structure/Message';
import { RecvPayload, Message } from 'src/common/structure/Message';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import typia from 'typia';
import { ChannelRepository } from 'src/injectable/repository/channel.repository';
import { ConnectionService } from './connection.service';
import { PrismaService } from './prisma.service';
import { ChannelMemberRepository } from 'src/injectable/repository/channel-member.repository';
import { JWTPayload } from 'src/common/structure/Auth';
import { Client } from 'src/common/structure/Client';
import { IChannelIdParam } from 'src/common/structure/Channel';

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
        return await this.identifyClient(server, client, message);
      }
      default:
        console.log(message);
        return;
    }
  }

  public async handleDisconnect(client: Socket) {
    await this.connectionService.deregisterClient(client.data.user.id);
  }

  /**
   * @description [WS Only] 유저가 전송한 메세지를 특정 채널에 전송합니다.
   * @param {object} server socket.io Server 객체
   * @param {object} client socket.io Socket 객체
   * @param {object} message 유저가 전송한 메세지 객체
   * @throws {GatewayException, TypeGuardError}
   */
  public async sendMessage(server: Server, client: Socket, message: Message<RecvPayload.Text>) {
    this.isClientIdentified(client);

    typia.assertEquals<Message<RecvPayload.Text>>(message);

    const msg: Message = {
      op: SendOP.DISPATCH_MESSAGE,
      d: {
        channelId: message.d.channelId,
        message: message.d.message,
        timestamp: Date.now(),
        sender: client.data.user,
      },
    };

    return await this.dispatch(server, client, msg);
  }

  public async identifyClient(server: Server, client: Socket, message: Message) {
    typia.assertEquals<Message<RecvPayload.Identify>>(message);

    const { id: userId } = this.authService.verifyAccessToken(message.d.accessToken);

    const regRst = await this.connectionService.registerClient(userId, client.id);
    if (regRst.oldClient) await this.disconnectOldClient(server, regRst.oldClient);

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
    this.initClientIdentifier(client, { id: userId, nickname, socialType });

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
   * @param {string} param
   * @returns {Array<User>} 멤버 목록
   */
  public async getChannelMembers(param: IChannelIdParam) {
    typia.assertEquals<IChannelIdParam>(param);
    return this.memberRepository.findChannelMembers(param.channelId);
  }

  private async checkMessagePermission(client: Socket, message: Message) {
    if (!client.rooms.has(message.d.channelId)) {
      throw new GatewayException(error.NO_PERMISSION);
    }
  }

  private async saveMessage(message: Message) {
    // 바로 저장 vs MQ 에 넘기기
  }

  private initClientIdentifier(client: Socket, data: Client.InitPayload) {
    client.data.user = data;
  }

  private isClientIdentified(client: Socket) {
    if (!client.data.user) throw new GatewayException(error.CLIENT_NOT_IDENTIFIED);
  }

  public async checkChannelExists(channelId: string) {
    if (await this.connectionService.isChannelCached(channelId)) return;

    const channel = await this.channelRepository.getChannelById(channelId);
    if (!channel) throw new GatewayException(error.CHANNEL_NOT_FOUND);

    await this.connectionService.cacheChannels(channelId);

    return true;
  }

  public async createChannel(user: JWTPayload, dto: any) {
    const channel = await this.channelRepository.createChannel(user.id, dto.channelName);
    return channel.id;
  }

  public async getJoinedChannels(user: JWTPayload) {
    return this.channelRepository.getJoinedChannelListByUserId(user.id);
  }

  public async addMemberToChannel(user: JWTPayload, param: IChannelIdParam) {
    typia.assertEquals<IChannelIdParam>(param);
    await this.checkChannelExists(param.channelId);
    const result = await this.channelRepository.addMemberToChannel(user.id, param.channelId);

    const clientId = await this.connectionService.getClientId(user.id);
    // if client is online
    if (clientId) {
      const client = (await this.server.in(clientId).fetchSockets())[0];
      const newChannel: Message<SendPayload.UpdateChannel> = {
        op: SendOP.UPDATE_CHANNEL,
        d: {
          channelId: result.channelId,
          members: false,
        },
      };
      client.join(param.channelId);
      client.emit('message', newChannel);
    }

    return result;
  }

  private async disconnectOldClient(server: Server, socketId: string) {
    const oldClient = (await server.in(socketId).fetchSockets())[0];
    const error: Message = {
      op: SendOP.ERROR,
      d: {
        code: 4000,
        message: '새로운 클라이언트로 접속하여 기존 연결을 종료합니다.',
      },
    };
    oldClient?.emit('message', error);
    oldClient?.disconnect();
  }
}
