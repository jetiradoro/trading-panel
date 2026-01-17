import { ArrayMinSize, IsArray, IsString } from 'class-validator';

/**
 * DTO para reordenar símbolos
 */
export class ReorderSymbolsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[];
}
