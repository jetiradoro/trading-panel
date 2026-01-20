import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EodhdMarketDataProvider } from './providers/eodhd-market-data.provider';
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';
import marketDataConfig from './config';

/**
 * Modulo de proveedores de datos de mercado.
 */
@Module({
  imports: [ConfigModule.forFeature(marketDataConfig)],
  controllers: [MarketDataController],
  providers: [
    EodhdMarketDataProvider,
    {
      provide: 'MARKET_DATA_PROVIDERS',
      useFactory: (eodhd: EodhdMarketDataProvider) => [eodhd],
      inject: [EodhdMarketDataProvider],
    },
    MarketDataService,
  ],
  exports: [MarketDataService],
})
export class MarketDataModule {}
