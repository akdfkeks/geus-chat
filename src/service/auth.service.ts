import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ERROR } from 'src/common/error/error';
import { UserRepository } from 'src/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { JWTHelper } from 'src/common/util/jwt.helper';
import { IUserLoginDto, JWTPayload } from 'src/structure/dto/Auth';
import { GatewayException } from 'src/structure/dto/Exception';
import * as error from 'src/structure/dto/Exception';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from 'src/common/guard/jwt.guard';
import * as typia from 'typia';
import { Wrapper } from 'src/common/util/wrapper';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  public async login(dto: IUserLoginDto) {
    Wrapper.TryOrThrow(
      () => typia.assertEquals<IUserLoginDto>(dto),
      new BadRequestException({
        code: '123-123',
        title: '로그인에 실패했습니다.',
        message: '요청 형식이 올바르지 않습니다.',
      }),
    );

    const user = await this.userRepository.findUserByEmail(dto.email);
    const isPwCorrect = await bcrypt.compare(dto.password, user?.password || '');

    if (!user || !isPwCorrect)
      throw new UnauthorizedException({
        code: '123-123',
        title: '로그인에 실패했습니다.',
        message: '아이디 또는 비밀번호를 확인해주세요.',
      });

    // get token generator by curried function
    const tokenGenerator = JWTHelper.generate({ uid: user.user_id });
    const accessToken = tokenGenerator(JWT_ACCESS_SECRET)({ expiresIn: '1h' });
    const refreshToken = tokenGenerator(JWT_REFRESH_SECRET)({ expiresIn: '7d' });

    await this.userRepository.upsertChannelRefreshToken(user.user_id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   *
   * @param token JWT
   * @returns JWT payload
   */
  public verifyAccessToken(token: string) {
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

  public async refresh(dto: { accessToken: string; refreshToken: string }) {
    Wrapper.TryOrThrow(
      () => typia.assertEquals<{ accessToken: string; refreshToken: string }>(dto),
      new BadRequestException({
        code: '123-123',
        title: '사용자 인증에 실패했습니다.',
        message: '요청 형식이 올바르지 않습니다.',
      }),
    );

    const payload = JWTHelper.decode<JWTPayload>(dto.accessToken)();
    const refresh = await this.userRepository.findRefreshTokenByUserId(payload.uid);

    if (!refresh) {
    }
  }
}
