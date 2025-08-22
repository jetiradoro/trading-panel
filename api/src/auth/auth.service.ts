import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordHelper } from '../common/helpers/password.helper';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { TokenDto } from './dtos/token.dto';
import { JwtService } from '@nestjs/jwt';
import * as dayjs from 'dayjs';
import { Response } from 'express';
import { users } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private users: UsersService,
    private config: ConfigService,
  ) {}

  public async login(credentials: LoginDto, res: Response): Promise<TokenDto> {
    const user = await this.users.findBy({ email: credentials.username });
    if (!user) {
      throw new UnauthorizedException(
        `El email ${credentials.username} no existe.`,
      );
    }
    const pass_hash = PasswordHelper.comparePassword(
      credentials.password,
      user.password,
    );

    if (!pass_hash) {
      throw new UnauthorizedException('La contraseña es incorrecta.');
    }

    const token = this.setToken(user, res);

    return {
      name: user.name,
      email: user.email,
      access_token: token,
    };
  }

  public async refreshToken(
    refreshToken: string,
    res: Response,
  ): Promise<TokenDto> {
    const user = await this.users.findBy({
      refresh_token: refreshToken,
    });

    if (!user) {
      throw new UnauthorizedException('Refresh token no válido');
    }
    const token_expires = dayjs(user.token_expiration);
    const is_valid = token_expires.isAfter(dayjs());
    if (!is_valid) {
      throw new UnauthorizedException('Refresh token caducado');
    }

    const new_token = this.setToken(user, res);
    return {
      name: user.name,
      email: user.email,
      access_token: new_token,
    };
  }

  private setToken(user: users, res: Response): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: this.config.get('app.jwt.issuer'),
      sub: user.id,
      aud: this.config.get('app.jwt.audience'),
      iat: now,
      nbf: now - this.config.get('app.jwt.clockTolerance'),
      exp: now + this.config.get('app.jwt.expiration'),
    };

    const token = this.jwt.sign(payload);
    //crea un refresh token aleatorio para el usuario encriptado
    const refreshToken = PasswordHelper.generateRandomPassword();
    const expires_in = dayjs().add(1, 'days');
    this.users.update(user.id, {
      refresh_token: refreshToken,
      token_expiration: expires_in.toDate(),
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax', // or 'Strict' depending on your requirements
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
      path: '/auth/refresh',
    });
    return token;
  }
}
