import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import configObject from '../../config';
import { ConfigService } from '@nestjs/config';

describe('AuthGuard', () => {
  let jwtService: JwtService;
  let configService: ConfigService;
  const config = configObject();
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        ConfigService,
        {
          provide: 'JWT_MODULE_OPTIONS',
          useValue: {
            secret: config.app.jwt.secret, // This should match your actual secret
            signOptions: { algorithm: 'HS256' },
          },
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(new AuthGuard(jwtService, configService)).toBeDefined();
  });

  it('jwt example generator', () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: config.app.jwt.issuer,
      aud: config.app.jwt.audience,
      iat: now,
      nbf: now - config.app.jwt.clockTolerance,
      exp: now + config.app.jwt.expiration,
      sub: config.app.jwt.subscribe,
      // jti: 'test-jti-123',
    };

    const token = jwtService.sign(payload);

    console.log('Generated token:', token);

    // Verificar que se puede decodificar y que exp es correcto
    const decoded = jwtService.verify(token, {
      secret: config.app.jwt.secret,
      issuer: payload.iss,
      audience: payload.aud,
    });

    expect(decoded.sub).toBe(config.app.jwt.subscribe);
    expect(decoded.exp).toBeGreaterThan(now);
  });
});
