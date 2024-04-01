import { BadRequestException, Body, Controller, Post, UseFilters } from '@nestjs/common';
import * as error from 'src/common/error/http-error';
import { BadRequestFilter } from 'src/common/filter/BadRequest.filter';
import { Wrapper } from 'src/common/util/wrapper';
import { AuthService } from 'src/service/auth.service';
import { IUserLoginDto } from 'src/structure/dto/Auth';
import { assertEquals as validate } from 'typia';

@UseFilters(BadRequestFilter)
@Controller('/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  public async onLoginRequest(@Body() body: any) {
    Wrapper.TryOrThrow(
      () => validate<IUserLoginDto>(body),
      new BadRequestException(error.LOGIN_BAD_REQUEST),
    );

    return await this.authService.login(body);
  }

  @Post('/refresh')
  public async onRefreshRequest(@Body() body: any) {
    Wrapper.TryOrThrow(
      () => validate<{ token: { access: string; refresh: string } }>(body),
      new BadRequestException(error.REFRESH_BAD_REQUEST),
    );

    return await this.authService.refresh(body);
  }
}
