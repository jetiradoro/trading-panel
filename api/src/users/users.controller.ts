import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppClient } from '../common/decorators/app-client.decorator';

@Controller('users')
@UseGuards(AuthGuard) // Assuming you have an AuthGuard for authentication
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@AppClient() user): Promise<UserDto[]> {
    return this.usersService.findAll(user.id);
  }

  @Get('/me')
  me(@AppClient() user) {
    return user;
  }

  @Get(':id')
  async findOne(@AppClient() client, @Param('id') id: string): Promise<UserDto> {
    if (id !== client.id) {
      throw new HttpException('Acceso denegado', 403);
    }
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException('Usuario no encontrado', 404);
    }
    return user;
  }

  @Patch(':id')
  update(@AppClient() client, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (id !== client.id) {
      throw new HttpException('Acceso denegado', 403);
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@AppClient() client, @Param('id') id: string) {
    if (id !== client.id) {
      throw new HttpException('Acceso denegado', 403);
    }
    return this.usersService.remove(id);
  }
}
