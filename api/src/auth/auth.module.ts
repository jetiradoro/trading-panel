import { Module, Global } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('app.jwt.secret'),
        signOptions: { algorithm: 'HS256' as const },
        verifyOptions: {
          issuer: config.get('app.jwt.issuer'),
          audience: config.get('app.jwt.audience'),
          clockTolerance: config.get('app.jwt.clockTolerance'), //seconds
        },
      }),
    }),
  ],
  providers: [AuthService, UsersService],
  exports: [JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
