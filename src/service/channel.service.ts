import { Injectable, OnModuleInit, OnModuleDestroy, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GatewayException } from 'src/structure/dto/Exception';
import * as error from 'src/structure/dto/Exception';
import { ContentType, RecvOP, SendOP, SendPayload } from 'src/structure/dto/Message';
import { RecvPayload, Message } from 'src/structure/dto/Message';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import typia from 'typia';
import { ChannelRepository } from 'src/repository/channel.repository';
import { ConnectionService } from './connection.service';
import { PrismaService } from './prisma.service';
import { ChannelMemberRepository } from 'src/repository/channel-member.repository';
import { JWTPayload } from 'src/structure/dto/Auth';
import { IChannelIdParam, ICreateChannelDto, IGetChannelMessageQuery } from 'src/structure/dto/Channel';
import { MessageRepository } from 'src/repository/message.repository';
import { SnowFlake } from 'src/common/util/snowflake';
import { BigIntegerUtil } from 'src/common/util/bInteger.util';
import { UserRepository } from 'src/repository/user.repository';
import { Wrapper } from 'src/common/util/wrapper';
import { LogLevel, LoggerService } from 'src/module/winston.module';

@Injectable()
export class ChannelService implements OnModuleInit, OnModuleDestroy {
  public server: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly channelRepository: ChannelRepository,
    private readonly connectionService: ConnectionService,
    private readonly userRepository: UserRepository,
    private readonly memberRepository: ChannelMemberRepository,
    private readonly messageRepository: MessageRepository,
    private readonly logger: LoggerService,
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
    this.logger.log(LogLevel.DEBUG, 'Message logging', { data: message });
    switch (message.op) {
      case RecvOP.SEND_MESSAGE: {
        return await this.sendMessage(server, client, message);
      }
      case RecvOP.IDENTIFY: {
        return await this.identifyClient(server, client, message);
      }
      default:
        this.logger.log(LogLevel.WARN, 'Unknown operation', { message });
        return;
    }
  }

  public async handleDisconnect(client: Socket) {
    await this.connectionService.deregister(client);
  }

  public async sendMessage(server: Server, client: Socket, message: Message<RecvPayload.Text>) {
    if (!this.isClientIdentified(client)) {
      throw new GatewayException(error.CLIENT_NOT_IDENTIFIED);
    }

    // Message validation
    typia.assertEquals<Message<RecvPayload.Text>>(message);

    const snowflakeId = SnowFlake.generate();
    const msg: Message<SendPayload.Content> = {
      op: SendOP.DISPATCH_MESSAGE,
      d: {
        cid: message.d.cid,
        mid: snowflakeId,
        ctype: ContentType.TEXT,
        data: message.d.data,
        time: SnowFlake.parseDate(snowflakeId).toISOString(),
        uid: client.data.uid,
        uname: client.data.uname,
      },
    };

    return await this.dispatch(server, client, msg);
  }

  public async identifyClient(server: Server, client: Socket, message: Message) {
    if (client.data.uid) return; // Already identified

    typia.assertEquals<Message<RecvPayload.Identify>>(message);

    const { uid } = this.authService.verifyAccessToken(message.d.token);

    await this.connectionService.register(client, uid).then(async (old) => {
      if (old) await this.disconnectOldClient(server, old);
    });

    await this.initializeClient(client, uid);
    const msg: Message = {
      op: SendOP.HELLO,
      d: {
        uid,
        channels: [...client.rooms].slice(1), // Client ID 제외
      },
    };
    client.send(msg);
  }

  private async initializeClient(client: Socket, userId: number) {
    const { nickname } = await this.userRepository.findUserById(userId);
    const channels = await this.channelRepository.getJoinedChannelsIdByUserId(userId);

    client.data = { uid: userId, uname: nickname };

    await client.join(channels);

    return;
  }

  private async dispatch(server: Server, client: Socket, message: Message<SendPayload.Content>) {
    if (!client.rooms.has(message.d.cid)) {
      throw new GatewayException(error.NO_PERMISSION);
    }

    await this.messageRepository.saveMessage({ ...message.d });

    server.to(message.d.cid).emit('message', BigIntegerUtil.stringifyBigInt(message));
    return;
  }

  public async getChannelMembers(param: IChannelIdParam) {
    Wrapper.TryOrThrow(
      () => typia.assertEquals<IChannelIdParam>(param),
      new BadRequestException({
        code: '123-123',
        title: '채널 참가자 조회에 실패했습니다.',
        message: '요청 형식이 올바르지 않습니다.',
      }),
    );
    return this.memberRepository.findChannelMembers(param.channelId);
  }

  private isClientIdentified(client: Socket) {
    return client.data.uid !== undefined || client.data.uid !== null;
  }

  public async checkChannelExists(channelId: string) {
    if (await this.connectionService.isChannelCached(channelId)) return;

    const channel = await this.channelRepository.getChannelById(channelId);
    if (!channel) throw new GatewayException(error.CHANNEL_NOT_FOUND);

    await this.connectionService.cacheChannels(channelId);

    return true;
  }

  public async createChannel(user: JWTPayload, dto: ICreateChannelDto) {
    Wrapper.TryOrThrow(
      () => typia.assertEquals<ICreateChannelDto>(dto),
      new BadRequestException({
        code: '123-123',
        title: '채널 생성에 실패했습니다.',
        message: '요청 형식이 올바르지 않습니다.',
      }),
    );
    const channel = await this.channelRepository.createChannel(user.uid, dto.channelName);
    return channel.id;
  }

  public async getJoinedChannels(user: JWTPayload) {
    return this.channelRepository.getJoinedChannelListByUserId(user.uid);
  }

  public async addMemberToChannel(user: JWTPayload, param: IChannelIdParam) {
    Wrapper.TryOrThrow(
      () => typia.assertEquals<IChannelIdParam>(param),
      new BadRequestException({
        code: '123-123',
        title: '채널 생성에 실패했습니다.',
        message: '요청 형식이 올바르지 않습니다.',
      }),
    );

    await this.checkChannelExists(param.channelId);
    const result = await this.channelRepository.addMemberToChannel(user.uid, param.channelId);

    const clientId = await this.connectionService.getClientId(user.uid);
    // if client is online
    if (!clientId) return result;

    const client = (await this.server.in(clientId).fetchSockets())[0];
    const newChannel: Message<SendPayload.UpdateChannel> = {
      op: SendOP.UPDATE_CHANNEL,
      d: {
        cid: result.channelId,
        members: [],
      },
    };
    client?.join(param.channelId);
    client?.emit('message', newChannel);

    return result;
  }

  private async disconnectOldClient(server: Server, socketId: string) {
    const oldClient = (await server.in(socketId).fetchSockets())[0];
    const error: Message = {
      op: SendOP.ERROR,
      d: {
        code: 4000,
        message: '새로운 기기에서 접속하여 기존 연결을 종료합니다.',
      },
    };
    oldClient?.emit('message', error);
    oldClient?.disconnect();
  }

  public async getMessageHistory(user: JWTPayload, param: IChannelIdParam, query: IGetChannelMessageQuery) {
    Wrapper.TryOrThrow(
      () => {
        typia.assertEquals<IChannelIdParam>(param);
        typia.assertEquals<IGetChannelMessageQuery>(query);
      },
      new BadRequestException({
        code: '123-123',
        title: '대화내역을 불러오지 못했습니다.',
        message: '요청 형식이 올바르지 않습니다.',
      }),
    );
    const isMemberOfChannel = (await this.memberRepository.findChannelMembers(param.channelId))
      .map(({ id }) => id)
      .includes(user.uid);

    if (!isMemberOfChannel) {
      throw new UnauthorizedException({
        code: '123-123',
        title: '대화내역을 불러오지 못했습니다.',
        message: '잘못된 요청입니다.',
      });
    }

    return this.messageRepository.getMessagesByQuery(param.channelId, query);
  }
}
