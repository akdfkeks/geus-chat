import { Body, Controller, Get, HttpCode, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { BadRequestFilter } from 'src/common/filter/BadRequest.filter';
import { AuthService } from 'src/service/auth.service';
import typia from 'typia';

@UseFilters(BadRequestFilter)
@Controller('/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  public async onLoginRequest(@Body() body: any) {
    return await this.authService.login(body);
  }

  @Post('/refresh')
  public async onRefreshRequest(@Body() body: any) {
    return await this.authService.refresh(body);
  }
}
