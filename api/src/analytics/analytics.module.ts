import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountsService } from '../accounts/accounts.service';

/**
 * Módulo de analítica para dashboard de inversiones
 */
@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AccountsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
