/**
 * Tipos de datos para el módulo de analítica
 */

export interface AccountBalanceDto {
  totalFromTransactions: number;
  totalInvested: number;
  availableCash: number;
  investedTrading: number;
  investedEtf: number;
  openPnLTrading: number;
  openPnLEtf: number;
  totalOpenPnL: number;
  totalOpenValue: number;
}

export interface PerformanceDto {
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  totalPnLPercentage: number;
  winningOperations: number;
  losingOperations: number;
  winRate: number;
}

export interface SymbolPerformanceDto {
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

export interface ProductDistributionDto {
  product: string;
  label: string;
  totalInvested: number;
  percentage: number;
  operationsCount: number;
  pnl: number;
}

export interface PortfolioPointDto {
  date: string;
  totalInvested: number;
  portfolioValue: number;
  pnl: number;
}

export interface MonthlyPerformanceDto {
  month: string;
  year: number;
  pnl: number;
  pnlPercentage: number;
  operationsClosed: number;
  winRate: number;
}

export interface EquityPointDto {
  date: string;
  equity: number;
  deposits: number;
  withdrawals: number;
  pnl: number;
}

export interface RiskMetricsDto {
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPercentage: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
}

export interface DashboardResponseDto {
  accountBalance: AccountBalanceDto;
  performance: PerformanceDto;
  symbolsRanking: SymbolPerformanceDto[];
  productDistribution: ProductDistributionDto[];
  portfolioEvolution: PortfolioPointDto[];
  monthlyPerformance: MonthlyPerformanceDto[];
  equityCurve: EquityPointDto[];
  riskMetrics: RiskMetricsDto;
  lastUpdated: string;
}

export type PeriodType = '7d' | '30d' | '90d' | '1y' | 'all';
export type ProductScope = 'trading' | 'etf';
