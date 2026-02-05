import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { UpdateOperationStatusDto } from './dto/update-operation-status.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppClient } from '../common/decorators/app-client.decorator';
import { users } from '@prisma/client';
import { AccountsService } from '../accounts/accounts.service';

/**
 * Controlador para gestionar operaciones de trading
 */
@Controller('operations')
@UseGuards(AuthGuard)
export class OperationsController {
  constructor(
    private readonly service: OperationsService,
    private readonly accountsService: AccountsService,
  ) {}

  @Post()
  async create(@AppClient() user: users, @Body() data: CreateOperationDto) {
    data.userId = user.id;
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    data.accountId = account.id;
    return this.service.create(data);
  }

  @Get()
  async findAll(
    @AppClient() user: users,
    @Query('status') status?: string,
    @Query('product') product?: string,
    @Query('symbolId') symbolId?: string,
  ) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.findAll({
      userId: user.id,
      accountId: account.id,
      status,
      product,
      symbolId,
    });
  }

  @Get(':id')
  async findOne(@AppClient() user: users, @Param('id') id: string) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    const rs = await this.service.findOne(id, user.id, account.id);
    console.log('Operation found:', rs);
    return rs;
  }

  @Patch(':id/status')
  async updateStatus(
    @AppClient() user: users,
    @Param('id') id: string,
    @Body() data: UpdateOperationStatusDto,
  ) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.updateStatus(id, data.status, user.id, account.id);
  }

  @Post(':id/entries')
  async addEntry(
    @AppClient() user: users,
    @Param('id') id: string,
    @Body() data: CreateEntryDto,
  ) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.addEntry(id, data, user.id, account.id);
  }

  @Put(':id/entries/:entryId')
  async updateEntry(
    @AppClient() user: users,
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() data: UpdateEntryDto,
  ) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.updateEntry(id, entryId, data, user.id, account.id);
  }

  @Delete(':id/entries/:entryId')
  async removeEntry(
    @AppClient() user: users,
    @Param('id') id: string,
    @Param('entryId') entryId: string,
  ) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.removeEntry(id, entryId, user.id, account.id);
  }

  @Delete(':id')
  async remove(@AppClient() user: users, @Param('id') id: string) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new Error('No active account found');
    }
    return this.service.remove(id, user.id, account.id);
  }
}
