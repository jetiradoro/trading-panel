import { IsOptional, IsIn } from 'class-validator';

/**
 * Query params para endpoints de analítica
 */
export class AnalyticsQueryDto {
  @IsOptional()
  @IsIn(['7d', '1m', '3m', '6m', '30d', '90d', '1y', '5y', 'all'])
  period?: '7d' | '1m' | '3m' | '6m' | '30d' | '90d' | '1y' | '5y' | 'all' = '30d';

  @IsOptional()
  @IsIn(['trading', 'etf'])
  product?: 'trading' | 'etf';

  @IsOptional()
  accountId?: string;
}
