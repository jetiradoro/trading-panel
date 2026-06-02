import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountsService } from '../accounts/accounts.service';
import { AnalyticsPerformanceCron } from './analytics-performance.cron';

/**
 * Módulo de analítica para dashboard de inversiones
 */
@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AccountsService, AnalyticsPerformanceCron],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
