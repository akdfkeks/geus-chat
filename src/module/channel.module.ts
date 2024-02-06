import { Module } from '@nestjs/common';
import { ChannelService } from 'src/service/channel.service';
import { SocketService } from 'src/service/socket.service';
import { UserService } from 'src/service/user.service';
import { AuthService } from 'src/service/auth.service';
import { UserRepository } from 'src/repository/user.repository';
import { ConnectionService } from 'src/service/connection.service';
import { ChannelRepository } from 'src/repository/channel.repository';
import { ChannelGateway } from 'src/controller/channel.gateway';
import { ChannelMemberRepository } from 'src/repository/channel-member.repository';
import { ChannelController } from 'src/controller/channel.controller';
import { MongoModule } from './mongo.module';
import { MessageHistoryRepository } from 'src/repository/message-history.repository';

@Module({
  imports: [MongoModule],
  controllers: [ChannelController],
  providers: [
    ChannelGateway,
    SocketService,
    ChannelService,
    UserService,
    AuthService,
    UserRepository,
    ConnectionService,
    ChannelRepository,
    ChannelMemberRepository,
    MessageHistoryRepository,
  ],
  exports: [],
})
export class ChannelModule {}
