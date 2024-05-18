import { Injectable, CanActivate, ExecutionContext, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ErrorUtil } from 'src/common/util/error.util';
import { JWTHelper } from 'src/common/util/jwt.helper';
import { JWTPayload } from 'src/structure/dto/Auth';
import * as ER from 'src/common/error/rest/expected';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.headers.authorization?.split('Bearer ')[1];
      request['user'] = { uid: JWTHelper.verify<JWTPayload>(token)(JWT_ACCESS_SECRET)().uid };
      return true;
    } catch (e) {
      throw ErrorUtil.unauthorized(ER.NO_ACCESS_TOKEN);
    }
  }
}
// Temp
export const JWT_ACCESS_SECRET = 'jwt_access_secret';
export const JWT_REFRESH_SECRET = 'jwt_refresh_secret';
