import { IsOptional, IsNumber, IsDateString } from 'class-validator';

/**
 * DTO para actualizar un precio histórico de un símbolo
 */
export class UpdatePriceHistoryDto {
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
