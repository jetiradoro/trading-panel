import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SymbolsService } from '../symbols/symbols.service';
import { appendLog } from '../common/utils/log-writer';

/**
 * Cron diario para sincronizar precios de mercado.
 */
@Injectable()
export class MarketSyncCron {
  constructor(private readonly symbolsService: SymbolsService) {}

  /**
   * Ejecuta a las 08:00 (Europe/Madrid).
   */
  @Cron('0 8 * * *', { timeZone: 'Europe/Madrid' })
  async handleCron() {
    try {
      await appendLog('cron_exec.log', 'INFO market_sync_cron start');
      await this.symbolsService.syncOpenOperationsMarketPrices();
      await appendLog('cron_exec.log', 'INFO market_sync_cron end');
    } catch (error: any) {
      const message = error?.message || 'Unknown cron error';
      await appendLog('cron_scheduler_error.log', `ERROR ${message}`);
    }
  }
}
