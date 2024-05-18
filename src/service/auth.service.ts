import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { JWTHelper } from 'src/common/util/jwt.helper';
import { IUserLoginDto, JWTPayload } from 'src/structure/dto/Auth';
import { GatewayException } from 'src/structure/dto/Exception';
import * as error from 'src/structure/dto/Exception';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from 'src/common/guard/jwt.guard';
import * as typia from 'typia';
import { Wrapper } from 'src/common/util/wrapper';
import { ErrorUtil } from 'src/common/util/error.util';
import * as ER from 'src/common/error/rest/expected';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  public async login(dto: IUserLoginDto) {
    Wrapper.TryOrThrow(() => typia.assertEquals<IUserLoginDto>(dto), ErrorUtil.badRequest(ER.LOGIN_FAILED_BAD_REQUEST));

    const user = await this.userRepository.findUserByEmail(dto.email);
    const isPwCorrect = await bcrypt.compare(dto.password, user?.password || '');

    if (!user || !isPwCorrect) throw ErrorUtil.notFound(ER.LOGIN_FAILED_NOT_FOUND);

    // get token generator by curried function
    const tokenGenerator = JWTHelper.generate({ uid: user.id });
    const accessToken = tokenGenerator(JWT_ACCESS_SECRET)({ expiresIn: '1h' });
    const refreshToken = tokenGenerator(JWT_REFRESH_SECRET)({ expiresIn: '7d' });

    await this.userRepository.upsertChannelRefreshToken(user.id, refreshToken);

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
      ErrorUtil.badRequest(ER.AUTH_FAILED_BAD_REQUEST),
    );

    const payload = JWTHelper.decode<JWTPayload>(dto.accessToken)();
    const refresh = await this.userRepository.findRefreshTokenByUserId(payload.uid);

    if (!refresh) {
    }
  }
}
