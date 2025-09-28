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
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { TransactionsService } from './transactions.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { transactions } from '@prisma/client';
import { NewTransactionDto } from './dtos/NewTransactionDto';
import { AppClient } from 'src/common/decorators/app-client.decorator';
import * as dayjs from 'dayjs';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(
    private readonly service: TransactionsService,
    private readonly accountsService: AccountsService,
  ) {}

  @Get()
  getCurrentTransactions(): Promise<Array<transactions>> {
    return this.service.getTransactions({});
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
    console.log({ user, data });
    return this.service.createTransaction(data);
  }

  @Delete(':id')
  async removeById(@Param('id') id: string): Promise<boolean> {
    try {
      await this.service.removeTransaction(id);
      return true;
    } catch (e) {
      console.error(e);
      throw new HttpException('No se ha podido borrar el registro', 400);
    }
  }
}
