import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ERROR } from 'src/common/error/error';
import { UserRepository } from 'src/injectable/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { JWTHelper } from 'src/util/jwt.helper';
import { JWTPayload } from 'src/common/structure/Auth';
import { GatewayException } from 'src/common/structure/Exception';
import * as error from 'src/common/structure/Exception';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from 'src/common/guard/jwt.guard';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  public async login(email: string, plainPw: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) throw new NotFoundException('No such user');

    const isCorrectPw = await bcrypt.compare(plainPw, user.password);
    if (!isCorrectPw) throw new UnauthorizedException('Password incorrect');

    // get token generator by curried function
    const tokenGenerator = JWTHelper.generate({ id: user.user_id });
    const accessToken = tokenGenerator(JWT_ACCESS_SECRET)({ expiresIn: 100 });
    const refreshToken = tokenGenerator(JWT_REFRESH_SECRET)({ expiresIn: '7d' });

    await this.userRepository.upsertChannelRefreshToken(user.user_id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   *
   * @param token JWT
   * @returns JWT payload
   */
  public verifyAccessToken(token: string | undefined) {
    if (!token) throw new WsException(ERROR.AUTH.NO_AUTH_TOKEN);
    try {
      return JWTHelper.verify<JWTPayload>(token)(JWT_ACCESS_SECRET)();
    } catch (e) {
      switch (e.name) {
        case 'TokenExpiredError': {
          throw new GatewayException(error.EXPIRED_ACCESS_TOKEN);
        }
        case 'JsonWebTokenError': {
          // 토큰에 문제가 있는 경우
          throw new GatewayException(error.INVALID_TOKEN);
        }
        case 'NotBeforeError': {
          // 활성화되지 않은 토큰? 시간에 관련된 에러
          throw new GatewayException(error.UNACTIVATED_TOKEN);
        }
        default: {
          throw new GatewayException(error.UNKNOWN_AUTH_ERROR);
        }
      }
    }
  }

  public async refresh(accessToken: string, refreshToken: string) {
    const payload = JWTHelper.decode<JWTPayload>(accessToken)();
    const refresh = await this.userRepository.findRefreshTokenByUserId(payload.id);
    if (!refresh) {
    }
  }
}
