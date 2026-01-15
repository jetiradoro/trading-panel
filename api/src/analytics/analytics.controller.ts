import { Controller, Get, Query, UseGuards, HttpException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppClient } from '../common/decorators/app-client.decorator';
import { users } from '@prisma/client';
import { AnalyticsQueryDto } from './dto/query.dto';
import { AccountsService } from '../accounts/accounts.service';

/**
 * Controlador para endpoints de analítica
 */
@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(
    private readonly service: AnalyticsService,
    private readonly accountsService: AccountsService,
  ) {}

  @Get('dashboard')
  async getDashboard(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getDashboard(user.id, query.period, account.id, query.product);
  }

  @Get('account-balance')
  async getAccountBalance(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getAccountBalance(user.id, account.id);
  }

  @Get('performance')
  async getPerformance(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getPerformance(user.id, query.period || '30d', account.id, query.product);
  }

  @Get('symbols-ranking')
  async getSymbolsRanking(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getSymbolsRanking(user.id, query.period || '30d', account.id, query.product);
  }

  @Get('product-distribution')
  async getProductDistribution(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getProductDistribution(user.id, account.id);
  }

  @Get('portfolio-evolution')
  async getPortfolioEvolution(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getPortfolioEvolution(user.id, query.period || '30d', account.id, query.product);
  }

  @Get('monthly-performance')
  async getMonthlyPerformance(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getMonthlyPerformance(user.id, account.id, query.product);
  }

  @Get('equity-curve')
  async getEquityCurve(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getEquityCurve(user.id, query.period || '30d', account.id, query.product);
  }

  @Get('risk-metrics')
  async getRiskMetrics(@AppClient() user: users, @Query() query: AnalyticsQueryDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getRiskMetrics(user.id, query.period || '30d', account.id, query.product);
  }
}
