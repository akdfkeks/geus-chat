import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

export class TestClient {
  public socket: Socket;
  public channels: any[];

  constructor(NODE_HOST: string, NODE_PORT: number | string, AUTH_TOKEN: string) {
    this.socket = io('http://' + NODE_HOST + ':' + NODE_PORT + '/v1/chat', {
      autoConnect: false,
      forceNew: true,
      extraHeaders: {
        authorization: AUTH_TOKEN,
      },
    });
  }

  public init(done: jest.DoneCallback) {
    this.socket.once('connected', (data) => {
      this.channels = data.channels || [];
      // log(this.channels);
      done();
    });
    this.socket.connect();
  }

  public on(ev: string, listener: (...args: any[]) => void) {
    this.socket.on(ev, listener);
  }

  public emit(ev: string, ...args: any[]) {
    this.socket.emit(ev, ...args);
  }
}
