import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Socket, io } from 'socket.io-client';
import { RecvOP, SendOP } from 'src/common/structure/Message';
import { RedisIoAdapter } from 'src/adapter/redis.adapter';
import { ConfigService } from '@nestjs/config';
import { RecvPayload, Message } from 'src/common/structure/Message';
import { AuthService } from 'src/service/auth.service';
import * as error from 'src/common/structure/Exception';
import * as request from 'supertest';
import { log } from 'console';
import { ulid } from 'ulidx';

describe('[Socket] ChannelGateway (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;

  let NODE_HOST: string;
  let NODE_PORT: string;

  let sender: Socket;
  let receiver: Socket;
  let senderAccess: string;
  let receiverAccess: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new RedisIoAdapter(app));

    configService = app.get(ConfigService);

    NODE_HOST = configService.get('NODE_HOST') || 'localhost';
    NODE_PORT = configService.get('NODE_PORT') || '3000';

    await (await app.init()).listen(NODE_PORT);
  });

  beforeAll(async () => {
    sender = io('http://' + NODE_HOST + ':' + NODE_PORT + '/v2/chat', {
      autoConnect: true,
      forceNew: true,
    });
    receiver = io('http://' + NODE_HOST + ':' + NODE_PORT + '/v2/chat', {
      autoConnect: true,
      forceNew: true,
    });
    senderAccess = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'test',
      })
      .then(({ body }) => body.accessToken);
    receiverAccess = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'bob@example.com',
        password: 'test',
      })
      .then(({ body }) => body.accessToken);
  });

  afterAll(async () => {
    sender?.disconnect();
    receiver?.disconnect();
    await app.close();
  });

  describe('클라이언트 인증', () => {
    let client: Socket;
    let accessToken: string;

    beforeAll(async () => {
      client = io('http://' + NODE_HOST + ':' + NODE_PORT + '/v2/chat', {
        autoConnect: true,
        forceNew: true,
      });
      accessToken = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'test',
        })
        .then(({ body }) => body.accessToken);
    });

    it('인증에 성공하면 참여중인 채널 정보를 수신합니다.', async () => {
      const identify: Message<RecvPayload.Identify> = {
        op: RecvOP.IDENTIFY,
        d: { accessToken },
      };

      return new Promise<void>((res, rej) => {
        client.send(identify);
        client.on('message', (data) => {
          if (data.op === SendOP.HELLO && data.d.channels) res();
        });
      });
    });

    afterAll(() => client.disconnect());
  });

  describe('메세지 전송/수신', () => {
    let senderChannels: Array<string>;
    let receiverChannels: Array<string>;
    beforeAll(async () => {
      const senderIdentify: Message<RecvPayload.Identify> = {
        op: RecvOP.IDENTIFY,
        d: { accessToken: senderAccess },
      };
      const receiverIdentify: Message<RecvPayload.Identify> = {
        op: RecvOP.IDENTIFY,
        d: { accessToken: senderAccess },
      };

      return await Promise.all([
        new Promise<void>((res, rej) => {
          sender.send(senderIdentify);
          sender.on('message', (data) => {
            if (data.op === SendOP.HELLO) {
              senderChannels = data.d.channels;
              res();
            }
          });
        }),
        new Promise<void>((res, rej) => {
          receiver.send(receiverIdentify);
          receiver.on('message', (data) => {
            if (data.op === SendOP.HELLO) {
              receiverChannels = data.d.channels;
              res();
            }
          });
        }),
      ]);
    });

    it('참여중이지 않은 채널에 전송을 시도하면 오류를 반환합니다.', async () => {
      const testMessage: Message<RecvPayload.Text> = {
        op: RecvOP.SEND_MESSAGE,
        d: {
          channelId: ulid(),
          message: 'hello',
        },
      };
      return new Promise<void>((res, rej) => {
        sender.send(testMessage);
        sender.on('message', (data) => {
          if (data.op !== SendOP.ERROR) return;
          if (data.d.code === error.NO_PERMISSION.code) {
            res();
          }
        });
      });
    });

    it('전송 성공 시 전송한 메세지를 수신합니다.', async () => {
      const testMessage: Message<RecvPayload.Text> = {
        op: RecvOP.SEND_MESSAGE,
        d: {
          channelId: senderChannels[0],
          message: 'hello',
        },
      };
      return new Promise<void>((res, rej) => {
        sender.send(testMessage);
        sender.on('message', (data) => {
          if (data.op !== SendOP.DISPATCH_MESSAGE) return;
          expect(data.d.channelId).toBe(testMessage.d.channelId);
          expect(data.d.message).toBe(testMessage.d.message);
          expect(data.d.timestamp).toBeLessThanOrEqual(Date.now());
          expect(data.d.sender.id).toBeDefined();
          expect(data.d.sender.nickname).toBeDefined();
          res();
        });
      });
    });

    it('다른 사용자가 전송한 메세지를 수신합니다.', async () => {
      const testMessage: Message<RecvPayload.Text> = {
        op: RecvOP.SEND_MESSAGE,
        d: {
          channelId: senderChannels[0],
          message: 'hello',
        },
      };
      return new Promise<void>((res, rej) => {
        sender.send(testMessage);
        receiver.on('message', (data) => {
          if (data.op !== SendOP.DISPATCH_MESSAGE) return;
          if (data.d.channelId === testMessage.d.channelId) {
            res();
          }
        });
      });
    });

    afterAll(() => {
      sender.disconnect();
      receiver.disconnect();
    });
  });
});
