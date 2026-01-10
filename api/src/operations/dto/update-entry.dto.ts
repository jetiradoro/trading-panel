import { IsOptional, IsNumber, IsIn, IsDateString } from 'class-validator';

/**
 * DTO para actualizar una entrada (buy/sell) en una operación
 */
export class UpdateEntryDto {
  @IsOptional()
  @IsIn(['buy', 'sell'])
  entryType?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
