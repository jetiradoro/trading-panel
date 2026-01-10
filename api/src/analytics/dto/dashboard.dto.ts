/**
 * DTOs para el módulo de analítica
 */

export class AccountBalanceDto {
  totalFromTransactions: number;
  totalInvested: number;
  availableCash: number;
}

export class PerformanceDto {
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  totalPnLPercentage: number;
  winningOperations: number;
  losingOperations: number;
  winRate: number;
}

export class SymbolPerformanceDto {
  symbolId: string;
  code: string;
  name: string;
  logo: string | null;
  product: string;
  totalInvested: number;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  pnlPercentage: number;
  operationsCount: number;
  sparklineData: number[];
}

export class ProductDistributionDto {
  product: string;
  label: string;
  totalInvested: number;
  percentage: number;
  operationsCount: number;
  pnl: number;
}

export class PortfolioPointDto {
  date: string;
  totalInvested: number;
  portfolioValue: number;
  pnl: number;
}

export class DashboardResponseDto {
  accountBalance: AccountBalanceDto;
  performance: PerformanceDto;
  symbolsRanking: SymbolPerformanceDto[];
  productDistribution: ProductDistributionDto[];
  portfolioEvolution: PortfolioPointDto[];
  lastUpdated: string;
}
