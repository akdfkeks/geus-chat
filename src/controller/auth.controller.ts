import { Body, Controller, Get, HttpCode, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/injectable/service/auth.service';
import typia from 'typia';

@Controller('/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseFilters()
  @UseGuards()
  @Post('/login')
  public async onLoginRequest(@Body() body: any) {
    typia.assertEquals<{ email: string; password: string }>(body);
    return await this.authService.login(body.email, body.password);
  }

  @Post('/refresh')
  public async onRefreshRequest(@Body() body: any) {
    typia.assertEquals<{ accessToken: string; refreshToken: string }>(body);
    return await this.authService.refresh(body.accessToken, body.refreshToken);
  }
}
