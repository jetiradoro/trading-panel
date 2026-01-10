import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppClient } from '../common/decorators/app-client.decorator';
import { users } from '@prisma/client';
import { AnalyticsQueryDto } from './dto/query.dto';

/**
 * Controlador para endpoints de analítica
 */
@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    return this.service.getDashboard(user.id, query.period, query.accountId);
  }

  @Get('account-balance')
  getAccountBalance(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    return this.service.getAccountBalance(user.id, query.accountId);
  }

  @Get('performance')
  getPerformance(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    return this.service.getPerformance(user.id, query.period || '30d', query.accountId);
  }

  @Get('symbols-ranking')
  getSymbolsRanking(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    return this.service.getSymbolsRanking(user.id, query.period || '30d', query.accountId);
  }

  @Get('product-distribution')
  getProductDistribution(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    return this.service.getProductDistribution(user.id, query.accountId);
  }

  @Get('portfolio-evolution')
  getPortfolioEvolution(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    return this.service.getPortfolioEvolution(user.id, query.period || '30d', query.accountId);
  }
}
