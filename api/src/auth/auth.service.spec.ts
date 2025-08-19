import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { TokenDto } from './dtos/token.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        UsersService,
        ConfigService,
        JwtService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.skip('login get token', async () => {
    const pass = 'Test1234';
    const user = await prisma.users.findFirst();
    if (!user) {
      throw new Error('No user found');
    }

    await expect(
      service.login({ email: 'abc@test.com', password: 'wrongpass' }),
    ).rejects.toThrow('El email abc@test.com no existe');

    await expect(
      service.login({ email: user.email, password: 'wrongpass' }),
    ).rejects.toThrow('La contraseña es incorrecta');

    const login: TokenDto = await service.login({
      email: user.email,
      password: pass,
    });

    //expect login is tokenDto instance
    expect(login).toHaveProperty('access_token');
    expect(login.access_token).toBeDefined();
  });
});
