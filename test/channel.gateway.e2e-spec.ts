import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/module/app.module';
import { Socket, io } from 'socket.io-client';
import { RedisIoAdapter } from 'src/common/adapter/redis.adapter';
import { ConfigService } from '@nestjs/config';
import { EventData } from 'src/structure/dto/Event';
import * as error from 'src/structure/dto/Exception';
import { SnowFlake } from 'src/common/util/snowflake';
import { RecvOP, SendOP } from 'src/common/constant/message';
import { Message } from 'src/structure/message';
import { TestClient, getChannels, getToken } from 'test/common/Client';

describe('[Socket] ChannelGateway (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;

  let NODE_HOST: string;
  let NODE_PORT: string;
  let baseURL: string;

  let sender: Socket;
  let receiver: Socket;
  let senderAccess: string;
  let receiverAccess: string;
  let senderChannels: Array<string>;
  let receiverChannels: Array<string>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new RedisIoAdapter(app));

    configService = app.get(ConfigService);

    NODE_HOST = configService.get('NODE_HOST') || 'localhost';
    NODE_PORT = configService.get('NODE_PORT') || '3000';
    baseURL = `${NODE_HOST}:${NODE_PORT}`;

    await (await app.init()).listen(NODE_PORT);
  });

  beforeAll(async () => {
    [senderAccess, receiverAccess] = await Promise.all([
      getToken(baseURL, { email: 'alice@example.com', password: 'test' }),
      getToken(baseURL, { email: 'bob@example.com', password: 'test' }),
    ]);

    [senderChannels, receiverChannels] = await Promise.all([
      getChannels(baseURL, senderAccess),
      getChannels(baseURL, receiverAccess),
    ]);

    sender = TestClient(`${baseURL}/v2/channel`, { auth: senderAccess });
    receiver = TestClient(`${baseURL}/v2/channel`, { auth: receiverAccess });
  });

  afterAll(async () => {
    sender?.disconnect();
    receiver?.disconnect();
    await app.close();
  });

  describe('클라이언트 인증', () => {
    it('잘못된 인증 형식을 전송하면 에러를 반환합니다.', async () => {
      const client = TestClient(`${baseURL}/v2/channel`, { autoConnect: false });
      return new Promise<void>((res, rej) => {
        client.connect();
        client.on('message', (data: any) => {
          if (data.op !== SendOP.ERROR) return;
          expect(data.d.code).toBe(error.INVALID_FORMAT.code);
          client.disconnect();
          res();
        });
      });
    });

    it('인증에 성공하면 사용자 ID를 수신합니다.', async () => {
      const client = TestClient(`${baseURL}/v2/channel`, { auth: senderAccess, autoConnect: false });
      return new Promise<void>((res, rej) => {
        client.connect();
        client.on('message', (data: any) => {
          if (data.op !== SendOP.HELLO) return;
          expect(data.d.id).toBeDefined();
          client.disconnect();
          res();
        });
      });
    });
  });

  describe('메세지 전송/수신', () => {
    it('참여중이지 않은 채널에 전송을 시도하면 오류를 반환합니다.', async () => {
      return new Promise<void>((res, rej) => {
        sender.emit('event', {
          op: RecvOP.SEND_MESSAGE,
          d: {
            cid: SnowFlake.generate().toString(),
            data: 'hello',
          },
        } satisfies EventData<Message.RecvDto>);

        sender.on('message', (data: any) => {
          if (data.op !== SendOP.ERROR) return;
          if (data.d.code === error.NO_PERMISSION.code) {
            res();
          }
        });
      });
    });

    it('전송 성공 시 전송한 메세지를 수신합니다.', async () => {
      const testMessage: EventData<Message.RecvDto> = {
        op: RecvOP.SEND_MESSAGE,
        d: {
          cid: senderChannels[0],
          data: 'hello',
        },
      };

      return new Promise<void>((res, rej) => {
        sender.emit('event', testMessage);
        sender.on('message', (data: any) => {
          if (data.op !== SendOP.DISPATCH_MESSAGE) return;
          expect(data.d.cid).toBeDefined();
          expect(data.d.data).toBeDefined();
          res();
        });
      });
    });
  });
});
