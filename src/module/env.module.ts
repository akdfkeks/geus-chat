import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const EnvConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: process.env.NODE_ENV == 'prod' ? 'prod.env' : 'dev.env',
  validationSchema: Joi.object({
    SOCKET_PORT: Joi.string().required(),
    NODE_PORT: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.string().required(),
    MONGODB_URL: Joi.string().required(),
  }),
});
