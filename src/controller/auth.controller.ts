import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { AuthService } from 'src/service/auth.service';

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
