import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { AccountsService } from 'src/accounts/accounts.service';

@Module({
  providers: [TransactionsService, AccountsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
