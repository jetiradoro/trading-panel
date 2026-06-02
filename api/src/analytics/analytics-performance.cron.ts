import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { appendLog } from '../common/utils/log-writer';
import { AnalyticsService } from './analytics.service';

/**
 * Cron diario para capturar snapshots de rendimiento global.
 */
@Injectable()
export class AnalyticsPerformanceCron {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Ejecuta a las 00:10 (Europe/Madrid).
   */
  @Cron('10 0 * * *', { timeZone: 'Europe/Madrid' })
  async handleCron() {
    try {
      await appendLog('cron_exec.log', 'INFO analytics_performance_cron start');
      await this.analyticsService.captureDailyPerformanceSnapshot();
      await appendLog('cron_exec.log', 'INFO analytics_performance_cron end');
    } catch (error: any) {
      const message = error?.message || 'Unknown analytics cron error';
      await appendLog('cron_scheduler_error.log', `ERROR ${message}`);
    }
  }
}
