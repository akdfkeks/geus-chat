import { OnModuleInit } from '@nestjs/common';
import { mapping } from 'cassandra-driver';
import { MessageModel } from 'src/model/messageLog.model';
import { CassandraService } from 'src/service/cassandra.service';

export class MessageRepository implements OnModuleInit {
  private messageLogMapper: mapping.ModelMapper<MessageModel>;
  public onModuleInit() {
    const mappingOptions: mapping.MappingOptions = {
      models: {
        MessageLog: {
          tables: ['MessageLog'],
          mappings: new mapping.UnderscoreCqlToCamelCaseMappings(),
        },
      },
    };
    this.messageLogMapper = this.cassandraService.createMapper(mappingOptions).forModel('MessagLog');
  }
  constructor(private readonly cassandraService: CassandraService) {}
}
