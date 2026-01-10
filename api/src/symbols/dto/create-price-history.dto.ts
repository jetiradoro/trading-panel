import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

/**
 * DTO para registrar un precio histórico de un símbolo
 */
export class CreatePriceHistoryDto {
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}
