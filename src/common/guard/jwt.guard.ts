import { Injectable, CanActivate, ExecutionContext, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JWTHelper } from 'src/common/util/jwt.helper';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.headers.authorization?.split('Bearer ')[1];
      request['user'] = JWTHelper.verify(token)(JWT_ACCESS_SECRET)();
      return true;
    } catch (e) {
      throw new UnauthorizedException({
        code: '123-123',
        title: 'Unauthorized Exception',
        content: '요청을 실행할 권한이 없습니다.',
      });
    }
  }
}

// Temp
export const JWT_ACCESS_SECRET = 'jwt_access_secret';
export const JWT_REFRESH_SECRET = 'jwt_refresh_secret';
