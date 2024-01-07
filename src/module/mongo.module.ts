import { Global, Module, Provider } from '@nestjs/common';
import { MONGODB_CONNECTION } from 'src/common/constant/database';
import { Db, MongoClient } from 'mongodb';

const provider: Provider = {
  provide: MONGODB_CONNECTION,
  useFactory: async (): Promise<Db> => {
    try {
      const client = await MongoClient.connect('mongodb://localhost');
      return client.db('geus-chat');
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};

@Global()
@Module({
  providers: [provider],
  exports: [provider],
})
export class MongoModule {
  constructor() {}
}
