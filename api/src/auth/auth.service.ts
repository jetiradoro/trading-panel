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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private users: UsersService,
    private config: ConfigService,
  ) {}

  public async login(credentials: LoginDto): Promise<TokenDto> {
    const user = await this.users.findBy({ email: credentials.email });
    if (!user) {
      throw new UnauthorizedException(
        `El email ${credentials.email} no existe.`,
      );
    }
    const pass_hash = PasswordHelper.comparePassword(
      credentials.password,
      user.password,
    );

    if (!pass_hash) {
      throw new UnauthorizedException('La contraseña es incorrecta.');
    }

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
    const expires_in = dayjs().add(30, 'days');
    this.users.update(user.id, {
      refresh_token: refreshToken,
      token_expiration: expires_in.toDate(),
    });
    return {
      access_token: token,
      refresh_token: refreshToken,
      expires_in: expires_in.unix(),
    };
  }
}
