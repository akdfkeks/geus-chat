import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private _server: Server;

  get getServer(): Readonly<Server> {
    return this._server;
  }
  set setServer(server: Server) {
    this._server = server;
  }
}
