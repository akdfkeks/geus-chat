import { UseFilters } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GwBadRequestFilter } from 'src/common/filter/GwBadRequest.filter';
import { GwExceptionFilter } from 'src/common/filter/GwException.filter';
import { ChannelService } from 'src/service/channel.service';

@UseFilters(new GwExceptionFilter(), new GwBadRequestFilter())
@WebSocketGateway({ namespace: 'v2/chat', cors: { origin: '*' } })
export class ChannelGateway implements OnGatewayInit {
  @WebSocketServer()
  private server: Server;

  constructor(private readonly channelService: ChannelService) {}

  public afterInit(server: Server) {
    this.channelService.server = this.server;
  }

  public async handleConnection(client: Socket) {}

  public async handleDisconnect(client: Socket) {
    return await this.channelService.handleDisconnect(client);
  }

  @SubscribeMessage('message')
  public async onMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any): Promise<void> {
    return await this.channelService.handleMessage(this.server, client, message);
  }
}
