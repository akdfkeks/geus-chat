import { Module } from '@nestjs/common';
import { UserService } from 'src/injectable/service/user.service';
import { AuthService } from 'src/injectable/service/auth.service';
import { AuthController } from 'src/controller/auth.controller';
import { UserRepository } from 'src/injectable/repository/user.repository';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [UserService, AuthService, UserRepository],
  exports: [],
})
export class AuthModule {}
