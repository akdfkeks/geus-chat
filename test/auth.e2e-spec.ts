import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { log } from 'console';
import { RedisIoAdapter } from 'src/common/adapter/redis.adapter';
import { AppModule } from 'src/module/app.module';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;

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

    (await app.init()).listen(NODE_PORT);

    return new Promise<void>((resolve, reject) => resolve());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('[ Http ] Authentication ', () => {
    test('Login test', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/auth/login`)
        .send({ email: 'alice@example.com', password: 'test' });
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });
  });
});
