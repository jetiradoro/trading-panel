import {
  IsNotEmpty,
  IsIn,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEntryDto } from './create-entry.dto';

/**
 * DTO para crear una operación de trading
 * La primera entrada es obligatoria
 */
export class CreateOperationDto {
  @IsNotEmpty()
  accountId: string;

  userId?: string;

  @IsNotEmpty()
  symbolId: string;

  @IsNotEmpty()
  @IsIn(['crypto', 'stock', 'etf', 'derivative'])
  product: string;

  @IsNotEmpty()
  @IsIn(['long', 'short'])
  type: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @IsPositive()
  leverage?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEntryDto)
  firstEntry?: CreateEntryDto;
}
