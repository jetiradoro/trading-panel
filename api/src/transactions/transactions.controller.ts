import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TransactionsService } from './transactions.service';
import { AccountsService } from '../accounts/accounts.service';
import { transactions } from '@prisma/client';
import { NewTransactionDto } from './dtos/NewTransactionDto';
import { AppClient } from '../common/decorators/app-client.decorator';
import * as dayjs from 'dayjs';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(
    private readonly service: TransactionsService,
    private readonly accountsService: AccountsService,
  ) {}

  @Get()
  async getCurrentTransactions(
    @AppClient() user,
  ): Promise<Array<transactions>> {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getTransactions({
      where: { userId: user.id, accountId: account.id },
    });
  }

  @Post()
  async createTransaction(@AppClient() user, @Body() data: NewTransactionDto) {
    data.amount = Number(data.amount);
    data.userId = user.id;
    data.date = dayjs(data.date).toDate();

    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    data.accountId = account.id;
    return this.service.createTransaction(data);
  }

  @Delete(':id')
  async removeById(
    @AppClient() user,
    @Param('id') id: string,
  ): Promise<boolean> {
    try {
      const account = await this.accountsService.findCurrentAccount(user.id);
      if (!account) {
        throw new HttpException('No active account found', 400);
      }
      await this.service.removeTransaction(id, user.id, account.id);
      return true;
    } catch (e) {
      console.error(e);
      throw new HttpException('No se ha podido borrar el registro', 400);
    }
  }
}
