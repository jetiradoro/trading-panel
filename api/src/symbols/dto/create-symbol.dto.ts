import { IsNotEmpty, IsOptional, IsIn } from 'class-validator';

/**
 * DTO para crear un símbolo de trading
 */
export class CreateSymbolDto {
  @IsNotEmpty()
  code: string;

  @IsOptional()
  marketCode?: string;

  @IsOptional()
  marketProvider?: string;

  @IsOptional()
  marketExchange?: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  logo?: string;

  @IsNotEmpty()
  @IsIn(['crypto', 'stock', 'etf', 'derivative'])
  product: string;
}
