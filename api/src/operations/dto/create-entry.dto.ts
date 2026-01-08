import { IsNotEmpty, IsNumber, IsIn, IsDateString, IsOptional } from 'class-validator';

/**
 * DTO para crear una entrada (buy/sell) en una operación
 */
export class CreateEntryDto {
  @IsNotEmpty()
  @IsIn(['buy', 'sell'])
  entryType: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}
