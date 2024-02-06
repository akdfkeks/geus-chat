import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MESSAGE_HISTORY } from 'src/common/constant/database';
import * as mongoose from 'mongoose';
import { MessageSchema } from 'src/structure/model/message';

export const MongoModule = MongooseModule.forRoot('mongodb://localhost/geus', {
  autoCreate: true,
});
