import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    try {
      const payload = this.jwt.verify(token);
      if (payload.sub !== this.config.get('app.jwt.subscribe')) {
        throw new UnauthorizedException('Invalid subject');
      }
      request.appClient = payload.sub;
      return true;
    } catch (e) {
      if (this.config.get('app.env') === 'dev') {
        console.error('Error verifying token:', e.message);
      }
      throw new UnauthorizedException('Invalid/expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') || [];
    return type === 'Bearer' ? token : undefined;
  }
}
