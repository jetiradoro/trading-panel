import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { AccountsService } from '../accounts/accounts.service';

@Module({
  controllers: [OperationsController],
  providers: [OperationsService, AccountsService],
  exports: [OperationsService],
})
export class OperationsModule {}
