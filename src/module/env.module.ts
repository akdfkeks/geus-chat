import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const EnvConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  ignoreEnvFile: process.env.NODE_ENV == 'local' ? false : true,
  envFilePath: `${process.env.NODE_ENV ?? 'local'}.env`,
  validationSchema: Joi.object({
    NODE_PORT: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.string().required(),
    MONGODB_URL: Joi.string().required(),
    'AWS.S3.REGION': Joi.string().required(),
    'AWS.S3.BUCKET': Joi.string().required(),
    'AWS.S3.BUCKET_RESIZED': Joi.string().required(),
    'AWS.S3.ACCESS_KEY_ID': Joi.string().required(),
    'AWS.S3.SECRET_ACCESS_KEY': Joi.string().required(),
  }),
});
