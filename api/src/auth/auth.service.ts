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

    const token = await this.createSessionToken(user, res);

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
    const session = await this.prisma.user_sessions.findUnique({
      where: { refresh_token: refreshToken },
      include: { user: true },
    });

    if (session) {
      const token_expires = dayjs(session.token_expiration);
      const is_valid = token_expires.isAfter(dayjs());
      if (!is_valid) {
        await this.prisma.user_sessions.delete({ where: { id: session.id } });
        throw new UnauthorizedException('Refresh token caducado');
      }

      const new_token = await this.rotateSessionToken(
        session.id,
        session.user,
        res,
      );
      return {
        name: session.user.name,
        email: session.user.email,
        access_token: new_token,
      };
    }

    const legacyUser = await this.users.findBy({
      refresh_token: refreshToken,
    });

    if (!legacyUser) {
      throw new UnauthorizedException('Refresh token no válido');
    }

    const legacyTokenExpires = dayjs(legacyUser.token_expiration);
    const isLegacyValid = legacyTokenExpires.isAfter(dayjs());
    if (!isLegacyValid) {
      throw new UnauthorizedException('Refresh token caducado');
    }

    const legacyToken = await this.createSessionToken(legacyUser, res);
    await this.prisma.users.update({
      where: { id: legacyUser.id },
      data: {
        refresh_token: null,
        token_expiration: null,
      },
    });
    return {
      name: legacyUser.name,
      email: legacyUser.email,
      access_token: legacyToken,
    };
  }

  /**
   * Genera un JWT de acceso para el usuario.
   */
  private buildAccessToken(user: users): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: this.config.get('app.jwt.issuer'),
      sub: user.id,
      aud: this.config.get('app.jwt.audience'),
      iat: now,
      nbf: now - this.config.get('app.jwt.clockTolerance'),
      exp: now + this.config.get('app.jwt.expiration'),
    };

    return this.jwt.sign(payload);
  }

  /**
   * Crea una nueva sesion con refresh token.
   */
  private async createSessionToken(user: users, res: Response): Promise<string> {
    const refreshLifetimeDays = 7;
    const token = this.buildAccessToken(user);
    const refreshToken = PasswordHelper.generateRandomPassword();
    const expires_in = dayjs().add(refreshLifetimeDays, 'days');
    await this.prisma.user_sessions.create({
      data: {
        userId: user.id,
        refresh_token: refreshToken,
        token_expiration: expires_in.toDate(),
      },
    });
    this.setRefreshCookie(res, refreshToken, refreshLifetimeDays);
    return token;
  }

  /**
   * Rota el refresh token de una sesion existente.
   */
  private async rotateSessionToken(
    sessionId: string,
    user: users,
    res: Response,
  ): Promise<string> {
    const refreshLifetimeDays = 7;
    const token = this.buildAccessToken(user);
    const refreshToken = PasswordHelper.generateRandomPassword();
    const expires_in = dayjs().add(refreshLifetimeDays, 'days');
    await this.prisma.user_sessions.update({
      where: { id: sessionId },
      data: {
        refresh_token: refreshToken,
        token_expiration: expires_in.toDate(),
      },
    });
    this.setRefreshCookie(res, refreshToken, refreshLifetimeDays);
    return token;
  }

  /**
   * Registra cookie de refresh token.
   */
  private setRefreshCookie(
    res: Response,
    refreshToken: string,
    refreshLifetimeDays: number,
  ) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax', // or 'Strict' depending on your requirements
      maxAge: refreshLifetimeDays * 24 * 60 * 60 * 1000, // 7 days in ms
      path: '/auth/refresh',
    });
  }
}
