import { Module } from '@nestjs/common';
import { SymbolsService } from './symbols.service';
import { SymbolsController } from './symbols.controller';
import { AccountsService } from '../accounts/accounts.service';

@Module({
  controllers: [SymbolsController],
  providers: [SymbolsService, AccountsService],
  exports: [SymbolsService],
})
export class SymbolsModule {}
