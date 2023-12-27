import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { JWTHelper } from 'src/util/jwt.helper';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.headers.authorization?.split('Bearer ')[1];
      request['user'] = JWTHelper.verify(token)(JWT_ACCESS_SECRET)();
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Temp
export const JWT_ACCESS_SECRET = 'jwt_access_secret';
export const JWT_REFRESH_SECRET = 'jwt_refresh_secret';
