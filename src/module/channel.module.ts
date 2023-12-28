import { Module } from '@nestjs/common';
import { CassandraService } from 'src/injectable/service/cassandra.service';
import { ChannelService } from 'src/injectable/service/channel.service';
import { SocketService } from 'src/injectable/service/socket.service';
import { UserService } from 'src/injectable/service/user.service';
import { AuthService } from 'src/injectable/service/auth.service';
import { UserRepository } from 'src/injectable/repository/user.repository';
import { ConnectionService } from 'src/injectable/service/connection.service';
import { ChannelRepository } from 'src/injectable/repository/channel.repository';
import { ChannelGateway } from 'src/gateway/channel.gateway';
import { ChannelMemberRepository } from 'src/injectable/repository/channel-member.repository';
import { ChannelController } from 'src/controller/channel.controller';

@Module({
  imports: [],
  controllers: [ChannelController],
  providers: [
    ChannelGateway,
    SocketService,
    CassandraService,
    ChannelService,
    UserService,
    AuthService,
    UserRepository,
    ConnectionService,
    ChannelRepository,
    ChannelMemberRepository,
  ],
  exports: [CassandraService],
})
export class ChannelModule {}
