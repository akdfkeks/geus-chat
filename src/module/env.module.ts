import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export const EnvConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  ignoreEnvVars: false,
  ignoreEnvFile: process.env.NODE_ENV == 'local' ? false : true,
  envFilePath: `${process.env.NODE_ENV ?? 'local'}.env`,
  validationSchema: Joi.object({
    NODE_PORT: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
    MONGODB_URL: Joi.string().required(),
    AWS_S3_REGION: Joi.string().required(),
    AWS_S3_BUCKET: Joi.string().required(),
    AWS_S3_BUCKET_RESIZED: Joi.string().required(),
    AWS_S3_ACCESS_KEY_ID: Joi.string().required(),
    AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
  }),
});
