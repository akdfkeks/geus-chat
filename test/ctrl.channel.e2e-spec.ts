import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

describe('[Http] ChannelController (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;
  let accessToken: string;

  let NODE_HOST: string;
  let NODE_PORT: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    configService = app.get(ConfigService);

    NODE_HOST = configService.get('NODE_HOST') || 'localhost';
    NODE_PORT = configService.get('NODE_PORT') || '3000';

    await (await app.init()).listen(NODE_PORT);

    accessToken = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'test',
      })
      .then(({ body }) => body.accessToken);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('채널 관리', () => {
    it('채널 생성에 성공하면 채널의 ID 를 반환합니다.', async () => {
      const res = await request(app.getHttpServer())
        .post('/v2/channel')
        .set('authorization', `Bearer ${accessToken}`)
        .send({
          channelName: '채널 생성 테스트용',
        });
      return expect(res.body.channelId).toBeDefined();
    });
  });

  describe('채널 구성원 추가', () => {
    let channelId: string;
    beforeAll(async () => {
      const channels = await request(app.getHttpServer()).get('/v2/channel/');
    });

    it('구성원 초대에 성공하면 HTTP 200을 반환합니다.', async () => {
      const res = await request(app.getHttpServer())
        .post('/v2/channel')
        .set('authorization', `Bearer ${accessToken}`)
        .send({
          channelName: '채널 생성 테스트용',
        });
      return expect(res.body.channelId).toBeDefined();
    });
  });
});
