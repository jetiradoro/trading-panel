import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AppClient } from '../common/decorators/app-client.decorator';
import { users } from '@prisma/client';

@Controller('accounts')
@UseGuards(AuthGuard)
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  @Post()
  create(@AppClient() user, @Body() data: CreateAccountDto) {
    data.userId = user.id;
    return this.service.create(data);
  }

  @Get()
  findAll(@AppClient() user: users) {
    return this.service.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findBy({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: CreateAccountDto) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
