import { UseFilters } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GwBadRequestFilter } from 'src/common/filter/gateway/GwBadRequest.filter';
import { GwExceptionFilter } from 'src/common/filter/gateway/GwException.filter';
import { ChannelGWService } from 'src/service/channel-gw.service';
import { EventData } from 'src/structure/dto/Event';

@UseFilters(GwExceptionFilter, GwBadRequestFilter)
@WebSocketGateway({ namespace: 'v2/channel', transports: ['websocket'], cors: { origin: '*' } })
export class ChannelGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(private readonly channelService: ChannelGWService) {}

  public afterInit(server: Server) {
    this.channelService.server = this.server;
  }

  public async handleConnection(client: Socket) {
    try {
      await this.channelService.initClient(client);
    } catch (e) {
      client.disconnect(true);
    }
  }

  public async handleDisconnect(client: Socket) {
    await this.channelService.handleDisconnect(client);
  }

  @SubscribeMessage('event')
  public async onEvent(@ConnectedSocket() client: Socket, @MessageBody() evt: EventData): Promise<void> {
    await this.channelService.handleEvent(client, evt);
  }
}
