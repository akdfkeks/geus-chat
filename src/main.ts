import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { RedisIoAdapter } from 'src/common/adapter/redis.adapter';
import { ConfigService } from '@nestjs/config';
import { BigIntSerializer } from 'src/common/interceptor/bigint-serializer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters();
  app.useGlobalInterceptors(new BigIntSerializer());
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  const configService = app.get(ConfigService);
  await app.listen(configService.get('NODE_PORT') || 3000, '0.0.0.0');

  app.enableShutdownHooks();
}
bootstrap();
