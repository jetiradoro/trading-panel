import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { PasswordHelper } from '../common/helpers/password.helper';
import { users } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new HttpException('El email ya existe con otro usuario.', 400);
    }
    const user = await this.prisma.users.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: PasswordHelper.hashPassword(createUserDto.password),
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return user;
  }

  findAll(): Promise<UserDto[]> {
    const users = this.prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  findOne(id: string): Promise<UserDto | null> {
    return this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  findBy(filter): Promise<users | null> {
    return this.prisma.users.findUnique({
      where: filter,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });
    if (!user) {
      throw new HttpException('Usuario no encontrado', 404);
    }

    if (updateUserDto.email) {
      const existingUser = await this.prisma.users.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('El email ya está en uso');
      }
    }
    const data = {
      email: updateUserDto.email ?? user.email,
      name: updateUserDto.name ?? user.name,
      refresh_token: updateUserDto.refresh_token ?? user.refresh_token,
      token_expiration: updateUserDto.token_expiration ?? user.token_expiration,
    };
    if (updateUserDto.password) {
      data['password'] = PasswordHelper.hashPassword(updateUserDto.password);
    }
    const updatedUser = await this.prisma.users.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });
    if (user) {
      return this.prisma.users.delete({
        where: { id },
      });
    }
    throw new HttpException('Usuario no encontrado', 404);
  }
}
