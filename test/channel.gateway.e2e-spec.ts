import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/module/app.module';
import { Socket, io } from 'socket.io-client';
import { RecvOP, SendOP } from 'src/structure/dto/Message';
import { RedisIoAdapter } from 'src/common/adapter/redis.adapter';
import { ConfigService } from '@nestjs/config';
import { RecvPayload, SendPayload, Message } from 'src/structure/dto/Message';
import { AuthService } from 'src/service/auth.service';
import * as error from 'src/structure/dto/Exception';
import * as request from 'supertest';
import { log } from 'console';
import { ulid } from 'ulidx';
import { Client } from 'src/structure/dto/Client';
import typia from 'typia';
import { BigIntegerUtil } from 'src/common/util/bInteger.util';

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
    sender = io('http://' + NODE_HOST + ':' + NODE_PORT + '/v2/channel', {
      autoConnect: true,
      forceNew: true,
    });
    receiver = io('http://' + NODE_HOST + ':' + NODE_PORT + '/v2/channel', {
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
      client = io('http://' + NODE_HOST + ':' + NODE_PORT + '/v2/channel', {
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

    it('잘못된 인증 형식을 전송하면 에러를 반환합니다.', async () => {
      return new Promise<void>((res, rej) => {
        client.send({
          op: RecvOP.IDENTIFY,
          d: { access: accessToken, unknownField: 'lololo' },
        } satisfies Message);

        client.on('message', (data) => {
          if (data.op !== SendOP.ERROR) return;
          expect(data.d.code).toBe(error.INVALID_FORMAT.code);
          res();
        });
      });
    });

    it('인증에 성공하면 참여중인 채널 정보를 수신합니다.', async () => {
      return new Promise<void>((res, rej) => {
        client.send({
          op: RecvOP.IDENTIFY,
          d: { token: accessToken },
        } satisfies Message<RecvPayload.Identify>);

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
      return await Promise.all([
        new Promise<void>((res, rej) => {
          sender.send({
            op: RecvOP.IDENTIFY,
            d: { token: senderAccess },
          } satisfies Message<RecvPayload.Identify>);

          sender.on('message', (data) => {
            if (data.op === SendOP.HELLO) {
              senderChannels = data.d.channels;
              res();
            }
          });
        }),
        new Promise<void>((res, rej) => {
          receiver.send({
            op: RecvOP.IDENTIFY,
            d: { token: receiverAccess },
          } satisfies Message<RecvPayload.Identify>);

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
      return new Promise<void>((res, rej) => {
        sender.send({
          op: RecvOP.SEND_MESSAGE,
          d: {
            cid: ulid(),
            data: 'hello',
          },
        } satisfies Message<RecvPayload.Text>);

        sender.on('message', (data) => {
          console.log(data);
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
          cid: senderChannels[0],
          data: 'hello',
        },
      };

      return new Promise<void>((res, rej) => {
        sender.send(testMessage);
        sender.on('message', (data) => {
          if (data.op === SendOP.DISPATCH_MESSAGE) {
            const parsed = BigIntegerUtil.parseBigInt(data);
            expect(parsed.d.cid).toBe(testMessage.d.cid);
            res();
          } else rej();
        });
      });
    });

    it('다른 사용자가 전송한 메세지를 수신합니다.', async () => {
      const testMessage: Message<RecvPayload.Text> = {
        op: RecvOP.SEND_MESSAGE,
        d: {
          cid: senderChannels[0],
          data: 'hello',
        },
      };
      return new Promise<void>((res, rej) => {
        sender.send(testMessage);
        receiver.on('message', (data) => {
          if (data.op === SendOP.DISPATCH_MESSAGE) {
            const parsed = BigIntegerUtil.parseBigInt(data);
            expect(parsed.d.cid).toBe(testMessage.d.cid);
            res();
          } else rej();
        });
      });
    });

    afterAll(() => {
      sender.disconnect();
      receiver.disconnect();
    });
  });
});
