import { Module } from '@nestjs/common';
import { SymbolsService } from './symbols.service';
import { SymbolsController } from './symbols.controller';
import { AccountsService } from '../accounts/accounts.service';
import { MarketDataModule } from '../market-data/market-data.module';

@Module({
  imports: [MarketDataModule],
  controllers: [SymbolsController],
  providers: [SymbolsService, AccountsService],
  exports: [SymbolsService],
})
export class SymbolsModule {}
