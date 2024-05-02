import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GatewayException } from 'src/structure/dto/Exception';
import * as error from 'src/structure/dto/Exception';
import { EventData } from 'src/structure/dto/Event';
import { AuthService } from './auth.service';
import typia from 'typia';
import { ConnectionService } from './connection.service';
import { MessageRepository } from 'src/repository/message.repository';
import { LogLevel, LoggerService } from 'src/module/winston.module';
import { isFalsy, isNil, isTruthy } from 'src/common/util/utils';
import { Wrapper } from 'src/common/util/wrapper';
import { ChannelRepository } from 'src/repository/channel.repository';
import { UserRepository } from 'src/repository/user.repository';
import { SendOP, RecvOP } from 'src/common/constant/message';
import { Message } from 'src/structure/message';
import * as EVENT from 'src/common/constant/event';
import { EventUtil } from 'src/common/util/event.util';

@Injectable()
export class ChannelGWService implements OnModuleInit, OnModuleDestroy {
  public server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly connectionService: ConnectionService,
    private readonly userRepo: UserRepository,
    private readonly channelRepo: ChannelRepository,
    private readonly messageRepo: MessageRepository,
    private readonly logger: LoggerService,
  ) {}

  public async onModuleInit() {}
  public async onModuleDestroy() {}

  public async initClient(client: Socket) {
    const isAuthFailed = !(await this.tryAuthenticate(client));
    /**
     * handleConnection에서 발생하는 예외는 Exception Filter에서
     * Catch 할 수 없으므로 예외를 발생시키지 않고 처리
     */
    if (isAuthFailed) {
      client.emit('event', EVENT.CLIENT_AUTH_FAILED);
      client.disconnect(true);
      return;
    }

    Promise.all([this.connectionService.register(client), this.initClientChannel(client)])
      .then(() => {
        client.emit('event', EventUtil.createHello(client.data.user.id));
        return;
      })
      .catch((e) => {
        this.logger.log(LogLevel.ERROR, e);
        client.emit('event', EVENT.CLIENT_REG_FAILED);
        client.disconnect(true);
        return;
      });
  }

  public async handleDisconnect(client: Socket) {
    return this.connectionService.deregister(client);
  }

  public async handleEvent(client: Socket, event: EventData) {
    Wrapper.TryOrThrow(() => typia.assertEquals<EventData>(event), new GatewayException(error.INVALID_FORMAT));

    switch (event.op) {
      case RecvOP.SEND_MESSAGE: {
        return this.broadcast(client, event.d);
      }
      default:
        return;
    }
  }

  public async broadcast(client: Socket, data: Message.RecvDto) {
    Wrapper.TryOrThrow(() => typia.assertEquals<Message.RecvDto>(data), new GatewayException(error.INVALID_FORMAT));

    if (!client.rooms.has(data.cid)) {
      throw new GatewayException(error.NO_PERMISSION);
    }

    return this.dispatch(client, data);
  }

  public async broadcastMedia(dto: { uid: bigint; cid: bigint; files: Array<Message.FileDto> }) {
    const message = await this.messageRepo.saveMessage({
      cid: dto.cid.toString(),
      data: '',
      uid: dto.uid.toString(),
      files: dto.files,
    });

    this.server.to(dto.cid.toString()).emit('event', { op: SendOP.DISPATCH_MESSAGE, d: message });
    return;
  }

  private async tryAuthenticate(client: Socket) {
    const auth = client.handshake.headers.authorization;
    if (isNil(auth)) return false;

    const bearer = auth!.split('Bearer ')[1];
    if (isFalsy(bearer)) return false;

    try {
      const tokenPayload = this.authService.verifyAccessToken(bearer); // expensive
      const user = await this.userRepo.findUserById(tokenPayload.uid);
      client.data.user = { id: tokenPayload.uid, name: user.name, avatar_url: user.avatar_url };
      return true;
    } catch (e) {
      return false;
    }
  }

  private isAuthorized(client: Socket) {
    return isTruthy(client.data.user.id);
  }

  private async initClientChannel(client: Socket) {
    const channels = await this.channelRepo.findJoinedChannelsIdByUserId(client.data.user.id);
    await client.join(channels);
  }

  private async dispatch(client: Socket, data: Message.RecvDto) {
    const message = await this.messageRepo.saveMessage({ ...data, uid: client.data.user.id });

    this.server.to(data.cid).emit('event', { op: SendOP.DISPATCH_MESSAGE, d: message });
    return;
  }
}
