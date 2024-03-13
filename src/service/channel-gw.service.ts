import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GatewayException } from 'src/structure/dto/Exception';
import * as error from 'src/structure/dto/Exception';
import { EventData } from 'src/structure/dto/Event';
import { AuthService } from './auth.service';
import typia from 'typia';
import { ConnectionService } from './connection.service';
import { MessageRepository } from 'src/repository/message.repository';
import { LoggerService } from 'src/module/winston.module';
import { isFalsy, isTruthy } from 'src/common/util/utils';
import { Wrapper } from 'src/common/util/wrapper';
import { ChannelRepository } from 'src/repository/channel.repository';
import { UserRepository } from 'src/repository/user.repository';
import { SendOP, RecvOP } from 'src/common/constant/message';
import { Message } from 'src/structure/message';

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
    if (!(await this.authenticate(client))) {
      client.send({
        op: SendOP.ERROR,
        d: { code: 4000, message: 'User authentication failed.' },
      });
      client.disconnect(true);
      return;
    }

    Promise.all([this.connectionService.register(client), this.initClientChannel(client)])
      .then(() => {
        client.send({
          op: SendOP.HELLO,
          d: { id: client.data.user.id },
        });
      })
      .catch((e) => {
        client.send({
          op: SendOP.ERROR,
          d: { code: 4000, message: 'User registeration failed.' },
        });
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

  private async authenticate(client: Socket) {
    const auth = client.handshake.headers.authorization;
    if (isFalsy(auth)) return false;

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

    this.server.to(data.cid).emit('message', { op: SendOP.DISPATCH_MESSAGE, d: message });
    return;
  }
}
