import {
  Controller,
  UseGuards,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { LoginDto } from './dtos/login.dto';
import { TokenDto } from './dtos/token.dto';
import { AuthService } from './auth.service';
import { PassThrough } from 'stream';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  public login(
    @Body() credentials: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenDto> {
    return this.service.login(credentials, res);
  }

  @Post('refresh')
  public refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'] ?? null;
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    return this.service.refreshToken(refreshToken, res);
  }
}
