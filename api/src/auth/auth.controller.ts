import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { LoginDto } from './dtos/login.dto';
import { TokenDto } from './dtos/token.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  public login(@Body() credentials: LoginDto): Promise<TokenDto> {
    return this.service.login(credentials);
  }
}

