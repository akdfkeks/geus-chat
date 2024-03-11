import { Module } from '@nestjs/common';
import { ChannelGWService } from 'src/service/channel-gw.service';
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
import { MessageRepository } from 'src/repository/message.repository';
import { ChannelService } from 'src/service/channel.service';

@Module({
  imports: [MongoModule],
  controllers: [ChannelController],
  providers: [
    ChannelGateway,
    SocketService,
    ChannelService,
    ChannelGWService,
    UserService,
    AuthService,
    UserRepository,
    ConnectionService,
    ChannelRepository,
    UserRepository,
    ChannelMemberRepository,
    MessageRepository,
  ],
  exports: [],
})
export class ChannelModule {}
