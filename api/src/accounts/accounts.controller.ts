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
import { AuthGuard } from '../auth/guards/auth.guard';
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

  @Get('active')
  findActiveByUser(@AppClient() user: users) {
    return this.service.findBy({
      userId: user.id,
      active: true,
    });
  }

  @Get(':id')
  findOne(@AppClient() user: users, @Param('id') id: string) {
    return this.service.findBy({ id, userId: user.id });
  }

  @Patch(':id')
  update(
    @AppClient() user: users,
    @Param('id') id: string,
    @Body() data: CreateAccountDto,
  ) {
    data.userId = user.id;
    return this.service.update(id, data, user.id);
  }

  @Delete(':id')
  remove(@AppClient() user: users, @Param('id') id: string) {
    return this.service.remove(id, user.id);
  }
}
